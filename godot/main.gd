extends Node

# Project title is empty in the settings because Godot overwrites web page titles unless the project title is empty

const Platform := preload("res://level/platform/platform.tscn")
const Pipe := preload("res://level/pipe/pipe.tscn")

# The zoom scale for the whole game.
var scale = 2.0
var has_entered_pipe := false
var game: JavaScriptObject
var window: JavaScriptObject
var document: JavaScriptObject
var onscroll_callback: JavaScriptObject
var platform_inserted_callback: JavaScriptObject
onready var level := $Level
onready var player := $Level/Player

func _ready():
	get_viewport().global_canvas_transform = get_viewport().global_canvas_transform.scaled(Vector2(scale, scale))
	
	if OS.get_name() == "HTML5":
		# CALLBACKS
		game = JavaScript.get_interface("game")
		window = JavaScript.get_interface("window")
		document = JavaScript.get_interface("document")
		
		onscroll_callback = JavaScript.create_callback(self, "onscroll_callback")
		game.set_onscroll_callback(onscroll_callback)
		
		platform_inserted_callback = JavaScript.create_callback(self, "platform_inserted_callback")
		game.set_platform_inserted_callback(platform_inserted_callback)
		
		# TRANSPARENT BACKGROUND
		
		VisualServer.set_default_clear_color(Color(0, 0, 0, 0))
		get_tree().get_root().set_transparent_background(true)
		OS.window_per_pixel_transparency_enabled = true
		
		# Spawns the ending pipe
		for i in range(0, 3):
			var exit_pipe := Pipe.instance()
			var exit_link = game.random_hyper_link()
			if exit_link != null:
				exit_pipe.level_name = exit_link.url
				exit_pipe.position.x = exit_link.x / scale
				exit_pipe.position.y = exit_link.y / scale - exit_pipe.size.y
				if exit_pipe.level_name.begins_with(document.location.origin):
					exit_pipe.color = "green" # same website domain
				else:
					exit_pipe.color = "red" # different website domain
				level.add_child(exit_pipe)
		
		# Centers player to page
		player.position.x = document.body.clientWidth / scale / 2.0
		player.position.y = 0
		
		# Pause the tree for a little bit because everything can look kinda jittery when first loading
		get_tree().paused = true
		yield(get_tree().create_timer(0.5), "timeout")
		get_tree().paused = false

func _process(delta):
	if OS.get_name() == "HTML5":
		# It would technically be better to check previous position to current position:
		# `pre_player_position != player.position`
		if player.velocity != Vector2.ZERO:
			game.scroll_center_to(player.position.x * scale, player.position.y * scale)

func onscroll_callback(args):
	var x = args[0]
	var y = args[1]
	get_viewport().global_canvas_transform.origin = Vector2(-x, -y)

func platform_inserted_callback(args):
	var x = args[0]
	var y = args[1]
	var w = args[2]
	var h = args[3]
	
	if y < 16:
		return; # Platforms can't be spawned too close to the top as to avoid hiding the plumber upon spawning
	
	var platform := Platform.instance()
	platform.position.x = x / scale
	platform.position.y = y / scale
	platform.size.x = w / scale
	platform.size.y = h / scale
	level.add_child(platform)

func _on_Player_enter_pipe(pipe):
	if OS.get_name() == "HTML5" && !has_entered_pipe:
		has_entered_pipe = true
		game.enter_level(pipe.level_name)
