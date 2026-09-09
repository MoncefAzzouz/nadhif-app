#!/bin/sh
# Rebuild the lighter white splash logo from the retained original animation.
# Usage: sh tool/remaster_splash_video.sh [output.mp4]
set -eu

script_dir="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
source_video="$script_dir/../assets/animation/splash_video_old.webm"
output_video="${1:-$script_dir/../assets/animation/splash_video.mp4}"

# Match IMG_3590.MP4's compact, flat lettering while retaining the word نظيف.
# The red channel isolates the white face without filling the cyan extrusion.
# Two pixels of erosion lighten the strokes and open the counters. Scale the
# word to about 42% of the screen width, matching the reference's proportions.
# Keep the 2.5-second reveal, then hold the finished logo for the rest of the
# original 10-second duration. This remasters existing motion, not new detail.
# Bake ColorApp.background (#415CFF) into every frame, including the padding.
logo_filter="trim=duration=2.5,tpad=stop_mode=clone:stop_duration=7.5,format=rgb24,extractplanes=r,gblur=sigma=0.8,lut=y='255*clip((val-105)/65,0,1)',erosion,erosion"
canvas_filter="scale=792:1408:flags=lanczos,gblur=sigma=0.45,pad=1440:2560:(ow-iw)/2:(oh-ih)/2:color=black"
blue_filter="setparams=range=full,format=rgb24,lutrgb=r='65+190*val/255':g='92+163*val/255':b=255,scale=in_range=full:out_range=tv:out_color_matrix=bt709,format=yuv420p,setparams=range=limited:color_primaries=bt709:color_trc=bt709:colorspace=bt709"

ffmpeg -hide_banner -loglevel warning -y \
  -i "$source_video" \
  -map 0:v:0 -map_metadata -1 -an -sn -dn \
  -vf "$logo_filter,$canvas_filter,$blue_filter" \
  -r 30 -c:v libx264 -preset slow -tune animation -crf 14 \
  -profile:v high -level:v 5.0 -maxrate 8M -bufsize 16M \
  -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -movflags +faststart \
  "$output_video"
