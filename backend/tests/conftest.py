import os


# Automated P0 regression tests must not depend on
# an external Supabase connection.
os.environ["RECOVERAI_PERSISTENCE_ENABLED"] = "false"