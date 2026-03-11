# Early access list processing scripts

Usage:

# CQC users

# Read latest CQC NI data
./scripts/early_access/read_contacts_file.py /path/to/cqc-contacts.xlsx
# Read list of NI subscribers
./scripts/early_access/read_ni_list.py /path/to/waitlist.xlsx
# Join lists together
./scripts/early_access/join_contacts_ni_lists.py


# LA users
./scripts/early_access/match_la_users_by_domain.py /path/to/userlist.csv /path/to/output.csv
