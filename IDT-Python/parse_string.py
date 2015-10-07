#!/usr/bin/python

import sys, getopt
import regex as re

# Supported emoticons
emoticons_list = {
   ":)"     : "<HAPPY>",
   "(;"     : "<REV_CHEEKY>",
   ":("     : "<SAD>",
   ":P"     : "<CHEEKY>",
   ";("     : "<CRY>",
   ":D"     : "<SUPER_HAPPY>",
   "[lol]"  : "<LOL>"
}

def main(msg):

   # Replace known emoticons with placeholders to avoid filtering
   for emot, placeholder in emoticons_list.iteritems():
      msg = msg.replace(emot, placeholder)

   # Remove all punctuation which is not '<', '>' or "_" (to preserve the placeholders)
   msg = re.sub(r"[^\P{P}<>_]+", " ", msg)

   # Replace placeholders with the emoticon
   for emot, placeholder in emoticons_list.iteritems():
      msg = msg.replace(placeholder, emot)

    # Print list of tokens
   print(filter(None, msg.split(" ")))

if __name__ == "__main__":
   main(sys.argv[1])
