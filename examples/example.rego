package authmerge

import data.authmerge.allow
import future.keywords

import input.action

default allow := false

allow if {
    input.action == "put"
}