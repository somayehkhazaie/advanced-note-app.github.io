import NotesAPI from "./NotesAPI.js";
import NotesView from "./notesView.js";

export default class NotesLogic {
  constructor(app) {
    this.app = app;

    const notesContainer = document.querySelector(".note-items");
    notesContainer.addEventListener(
      "click",
      (ev) => {
        // edit notes
        const noteTitle = this.app.querySelectorAll(".noteTitle");
        const noteBody = this.app.querySelectorAll(".noteBody");

        noteTitle.forEach((titleField) => {
          const noteID = titleField.dataset.noteId;
          titleField.addEventListener("keyup", () => {
            const newTitle = titleField.value.trim();
            const newBody = this.app
              .querySelector(`.noteBody[data-note-id="${noteID}"]`)
              .value.trim();
            this.editNote(newTitle, newBody, noteID);
          });
        });

        noteBody.forEach((bodyField) => {
          const noteID = bodyField.dataset.noteId;
          bodyField.addEventListener("keyup", () => {
            const newBody = bodyField.value.trim();
            const newTitle = this.app
              .querySelector(`.noteTitle[data-note-id="${noteID}"]`)
              .value.trim();
            this.editNote(newTitle, newBody, noteID);
          });
        });

        //button on note item clicked
        this.actionOnNote();

        // show password input
        const locksNotes = this.app.querySelectorAll(".passwordLock");
        locksNotes.forEach((lock) => {
          lock.addEventListener("click", (e) => {
            e.stopImmediatePropagation();
            this.showPasswordInput(e);
          });
        });

        // submit password
        const loginBtns = this.app.querySelectorAll(".loginBtn");
        loginBtns.forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.stopImmediatePropagation();
            this.login(e.target);
          });
        });
      },
      true
    );

    // add new note
    this.addNote();

    // search note title
    this.searchNote();

    // select note based on favorite color
    const favoriteColor = document.querySelector(".favoriteMenu");
    favoriteColor.addEventListener("click", (e) => {
      e.stopImmediatePropagation();
      const notes = NotesAPI.getNotes();
      let favoriteNote = [];
      e.target.dataset.color == "red"
        ? (favoriteNote = notes.filter(
            (note) => note.color === "red" && note.favorite
          ))
        : e.target.dataset.color == "yellow"
        ? (favoriteNote = notes.filter(
            (note) => note.color === "yellow" && note.favorite
          ))
        : e.target.dataset.color == "purple"
        ? (favoriteNote = notes.filter(
            (note) => note.color === "purple" && note.favorite
          ))
        : e.target.dataset.color == "orange"
        ? (favoriteNote = notes.filter(
            (note) => note.color === "orange" && note.favorite
          ))
        : e.target.dataset.color == "gray"
        ? (favoriteNote = notes.filter(
            (note) => note.color === "gray" && note.favorite
          ))
        : e.target.dataset.color == "blue"
        ? (favoriteNote = notes.filter(
            (note) => note.color === "blue" && note.favorite
          ))
        : (favoriteNote = notes.filter((note) => note.color === "transparen"));
      const notesView = new NotesView(this.app, null, favoriteNote);
    });

    // sort menu
    const lastUpdated = document.querySelector(".noteLastUpdated");
    const createdTime = document.querySelector(".noteCreatedTime");
    lastUpdated.addEventListener("click", (e) => {
      e.stopImmediatePropagation();
      const notes = NotesAPI.getNotes();
      const notesView = new NotesView(this.app, null, notes);
    });
    createdTime.addEventListener("click", (e) => {
      e.stopImmediatePropagation();
      const notes = NotesAPI.getNotesLastCreated();
      const notesView = new NotesView(this.app, null, notes);
    });
  }

  // search on note title
  searchNote() {
    const searchInput = document.querySelector(".searchInput");
    searchInput.addEventListener("input", (e) => {
      const notes = NotesAPI.getNotes();
      e.stopImmediatePropagation();

      const searchNotes = notes.filter((note) => {
        return note.title
          .toLowerCase()
          .includes(searchInput.value.toLowerCase().trim());
      });

      const notesView = new NotesView(this.app, null, searchNotes);
    });
  }

  // edite note
  editNote(newTitle, newBody, noteID) {
    // save to storage
    const notes = NotesAPI.getNotes();
    let editNote = notes.find((note) => note.id == noteID);
    editNote.title = newTitle;
    editNote.body = newBody;
    NotesAPI.saveNotes(editNote);
  }

  // add new note
  addNote() {
    const colorBtn = document.querySelector(".sideBarNoteColor");
    colorBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const note = {
        id: new Date().getTime(),
        title: "",
        body: "",
        password: "",
        favorite: false,
        color: `${e.target.dataset.color}`,
        createTime: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };
      const newNote = new NotesView(this.app, note, []);
      NotesAPI.saveNotes(note);
    });
  }

  //actions are favorite, password, edit color or delete note
  actionOnNote() {
    const action = this.app.querySelectorAll(".note-item");
    action.forEach((act) => {
      act.addEventListener(
        "click",
        (e) => {
          e.stopImmediatePropagation();

          // console.log(act.querySelector(".noteBody").value);
          // find note to action
          const noteID = act.dataset.noteId;
          const notes = NotesAPI.getNotes();
          const note = notes.find((item) => item.id == noteID);

          const actionTarget = e.target.closest(".noteBtn");

          if (actionTarget) {
            if (actionTarget.classList.contains("favoriteBtn")) {
              actionTarget.classList.toggle("note-favorite-btn--selected");
              if (
                actionTarget.classList.contains("note-favorite-btn--selected")
              ) {
                note.favorite = true;
              } else {
                note.favorite = false;
              }
              NotesAPI.saveNotes(note);
            }
            if (actionTarget.classList.contains("deleteBtn")) {
              // delete from local storage
              NotesAPI.deleteNote(noteID);
              // delete from DOM
              const newNote = new NotesView(this.app, null, []);
            }
            if (actionTarget.classList.contains("editBtn")) {
              actionTarget.lastElementChild.classList.toggle(
                "show-color-picker"
              );
              actionTarget.lastElementChild.classList.toggle("editMode");
              if (
                actionTarget.lastElementChild.classList.contains(
                  "show-color-picker"
                )
              ) {
                this.app.querySelector(".editMode").addEventListener(
                  "click",
                  (event) => {
                    event.target.classList.contains("note-color--red")
                      ? (note.color = event.target.dataset.color)
                      : event.target.classList.contains("note-color--yellow")
                      ? (note.color = event.target.dataset.color)
                      : event.target.classList.contains("note-color--blue")
                      ? (note.color = event.target.dataset.color)
                      : event.target.classList.contains("note-color--gray")
                      ? (note.color = event.target.dataset.color)
                      : event.target.classList.contains("note-color--purple")
                      ? (note.color = event.target.dataset.color)
                      : event.target.classList.contains("note-color--orange")
                      ? (note.color = event.target.dataset.color)
                      : "";

                    NotesAPI.saveNotes(note);
                    const newNote = new NotesView(this.app, null, []);
                  },
                  { once: true }
                );
              }
            }
            if (actionTarget.classList.contains("passwordBtn")) {
              const passwordBtnContent = actionTarget
                .closest(".note-item")
                .querySelector(".passwordBtnContent");
              passwordBtnContent.classList.add("show-password-btn-content");
              passwordBtnContent.querySelector(".passwordValue").value = "";
              passwordBtnContent
                .querySelector(".passwordValue")
                .classList.remove("wrong-password");
              passwordBtnContent.querySelector(".passwordConfirmValue").value =
                "";
              passwordBtnContent
                .querySelector(".passwordConfirmValue")
                .classList.remove("wrong-password");
              const saveBtns = this.app.querySelectorAll(".saveBtn");
              // console.log(saveBtns);
              saveBtns.forEach((btn) => {
                btn.addEventListener("click", (e) => {
                  e.stopImmediatePropagation();
                  // get password element and value

                  // get note-item element
                  const noteItem = e.target.closest(".note-item");
                  const passwordElement =
                    noteItem.querySelector(".passwordValue");
                  const password = passwordElement.value;
                  // get confirm password and element
                  const confirmPasswordElement = noteItem.querySelector(
                    ".passwordConfirmValue"
                  );
                  const confirmPassword = confirmPasswordElement.value;
                  // get note id
                  const noteId = noteItem.dataset.noteId;

                  // compare passwords
                  this.comparePassword(
                    password,
                    confirmPassword,
                    passwordElement,
                    confirmPasswordElement,
                    noteId
                  );
                });
              });

              // get cancel Btn
              const cancelBtns = this.app.querySelectorAll(".cancelBtn");
              cancelBtns.forEach((btn) => {
                btn.addEventListener("click", (e) => {
                  e.stopImmediatePropagation();
                  e.target
                    .closest(".note-item")
                    .querySelector(".passwordBtnContent")
                    .classList.remove("show-password-btn-content");
                });
              });
            }
          }
        },
        { once: true }
      );
    });
  }

  // compare password input with confirm password input and password on local storage
  comparePassword(
    password,
    confirmPassword,
    passwordElement,
    confirmPasswordElement,
    noteId
  ) {
    // find password input container
    const noteItem = this.app.querySelector(
      `.note-item[data-note-id="${noteId}"`
    );
    const passwordBtnContent = noteItem.querySelector(".passwordBtnContent");

    // check match password
    if (password != confirmPassword) {
      passwordElement.classList.add("wrong-password");
      confirmPasswordElement.classList.add("wrong-password");
    } else {
      const note = NotesAPI.findNote(noteId);
      note.password = password;
      passwordBtnContent.classList.remove("show-password-btn-content");
      NotesAPI.saveNotes(note);
    }
  }

  // show password inputs if lockBtn clicked
  showPasswordInput(element) {
    const lockBtn = element.target.closest(".passwordLock");
    lockBtn.classList.remove("wrong-password");
    let sibling = lockBtn.nextElementSibling;
    while (sibling) {
      sibling.classList.toggle("show-password-element");
      sibling.value = "";
      sibling = sibling.nextElementSibling;
    }
  }

  // login window 
  login(btn) {
    const noteId = btn.parentElement.parentElement.dataset.noteId;
    const note = NotesAPI.findNote(noteId);
    btn.previousElementSibling.value == note.password
      ? (btn.parentElement.style.display = "none")
      : btn.parentElement.firstElementChild.classList.add("wrong-password");
  }
}
