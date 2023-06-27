extends Node2D

export var size: Vector2 = Vector2(32, 32)
var level_name := "" # The name of the level this pipe leads to or the URL this pipe leads to.
var is_warp_pipe := true
var color := "green" setget set_color

func set_color(value: String):
	color = value
	match color:
		"green":
			$Sprite.texture = preload("green_pipe.png")
		"red":
			$Sprite.texture = preload("red_pipe.png")
		"yellow":
			$Sprite.texture = preload("yellow_pipe.png")
		_:
			$Sprite.texture = preload("blue_pipe.png")
