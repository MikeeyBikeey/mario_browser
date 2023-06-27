extends "res://entity/entity.gd"

const Pipe := preload("res://level/pipe/pipe.gd")

export var FRICTION: float = 500.0
export var ACCELERATION: float = 400.0
export var MAX_WALK_SPEED: float = 100.0
export var MAX_RUN_SPEED: float = 200.0
export var GRAVITY_MAX: float = 200.0
export var GRAVITY: float = 500.0
export var JUMP_IMPULSE: float = 300.0

var actions = {
	move_left = false,
	move_right = false,
	jump = false,
	crouch = false,
	run = false,
	use_power = false,
	enter_pipe = false,
}
var is_onground := false
var standing_on: Node2D

onready var sprite := $AnimatedSprite

signal enter_pipe(pipe)

func _ready():
	pass # Replace with function body.

func _process(delta):
	# GRAVITY
	
	if !is_onground:
		velocity.y = move_toward(velocity.y, GRAVITY_MAX, GRAVITY * delta)
	
	# INPUT AND VELOCITY
	
	var input_vel_x: float = 0.0
	if actions.move_left:
		input_vel_x -= 1.0
	if actions.move_right:
		input_vel_x += 1.0
	
	if input_vel_x != 0.0:
		if actions.run:
			velocity.x = move_toward(velocity.x, input_vel_x * MAX_RUN_SPEED, ACCELERATION * delta)
		else:
			velocity.x = move_toward(velocity.x, input_vel_x * MAX_WALK_SPEED, ACCELERATION * delta)
	else:
		velocity.x = move_toward(velocity.x, 0, FRICTION * delta)
	
	var pre_position := position
	position += velocity * delta
	
	# LAND ON GROUND
	
	if !is_onground && velocity.y > 0:
		var platforms := get_tree().get_nodes_in_group("platform")
		for platform in platforms:
			if pre_position.y <= platform.position.y && position.y > platform.position.y:
				var WIDTH: float = 8.0
				var left_side = position.x - WIDTH 
				var right_side = position.x + WIDTH 
				var left_side_is_within: bool = left_side > platform.position.x && left_side < platform.position.x + platform.size.x
				var right_side_is_within: bool = right_side > platform.position.x && right_side < platform.position.x + platform.size.x
				if left_side_is_within || right_side_is_within:
					is_onground = true
					standing_on = platform
					velocity.y = 0
					position.y = platform.position.y
					break
	
	# JUMP
	
	if is_onground && actions.jump:
		is_onground = false
		standing_on = null
		velocity.y = min(velocity.y, -JUMP_IMPULSE)
	
	# ANIMATIONS
	
	if !is_onground:
		sprite.animation = 'jump'
	elif input_vel_x != 0.0:
		if sign(input_vel_x) != sign(velocity.x):
			sprite.animation = 'skid'
		else:
			sprite.animation = 'run'
	else:
		sprite.animation = 'idle'
	
	if input_vel_x != 0.0:
		sprite.flip_h = input_vel_x < 0
	
	# FALL OFF PLATFORM
	
	if standing_on != null && is_instance_valid(standing_on):
		var WIDTH: float = 8.0
		var platform := standing_on
		var left_side = position.x - WIDTH 
		var right_side = position.x + WIDTH 
		var left_side_is_within: bool = left_side > platform.position.x && left_side < platform.position.x + platform.size.x
		var right_side_is_within: bool = right_side > platform.position.x && right_side < platform.position.x + platform.size.x
		if !(left_side_is_within || right_side_is_within):
			is_onground = false
			standing_on = null
	
	# ENTER PIPE
	
	if standing_on != null && actions.enter_pipe:
		var warp_pipes := get_tree().get_nodes_in_group("warp_pipe")
		for pipe in warp_pipes:
			if position.x > pipe.position.x && position.x < pipe.position.x + pipe.size.x:
				if position.y > pipe.position.y - 16.0 && position.y < pipe.position.y + pipe.size.y:
					emit_signal("enter_pipe", pipe)
					break

func _unhandled_input(event):
	for action in actions.keys():
		if event.is_action_pressed(action):
			actions[action] = true
		if event.is_action_released(action):
			actions[action] = false
