(() => {
  const STORAGE_KEY = 'daily-mood-board-entries';
  const moods = {
    happy: { emoji: '😊', label: 'Happy' },
    calm: { emoji: '😌', label: 'Calm' },
    okay: { emoji: '🙂', label: 'Okay' },
    low: { emoji: '😔', label: 'A little low' },
    wild: { emoji: '🤪', label: 'All over the place' }
  };
  const palette = ['#fff0cd', '#dff0e8', '#e7e6fb', '#dceaf5', '#f6dfdb'];
  const moodKeys = Object.keys(moods);
  const form = document.querySelector('#entry-form');
  const noteInput = document.querySelector('#note');
  const entriesEl = document.querySelector('#entries');
  const emptyState = document.querySelector('#empty-state');
  const countEl = document.querySelector('#entry-count');
  const countLabel = document.querySelector('#char-count');
  let selectedMood = 'happy';
  let entries = loadEntries();

  function loadEntries() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(saved) ? saved.filter((entry) => entry && moods[entry.mood] && typeof entry.id === 'string') : [];
    } catch {
      return [];
    }
  }

  function saveEntries() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // The board remains usable for this visit if browser storage is unavailable.
    }
  }

  function dateParts(timestamp) {
    const date = new Date(timestamp);
    return {
      date: new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date),
      time: new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date)
    };
  }

  function render() {
    entriesEl.replaceChildren();
    entries.forEach((entry, index) => {
      const mood = moods[entry.mood];
      const { date, time } = dateParts(entry.createdAt);
      const card = document.createElement('article');
      card.className = 'entry-card';
      card.dataset.mood = entry.mood;
      card.style.setProperty('--card-bg', palette[moodKeys.indexOf(entry.mood)]);

      const top = document.createElement('div');
      top.className = 'card-top';
      const moodLabel = document.createElement('div');
      moodLabel.className = 'card-mood';
      const emoji = document.createElement('span');
      emoji.setAttribute('aria-hidden', 'true');
      emoji.textContent = mood.emoji;
      moodLabel.append(emoji, document.createTextNode(mood.label));
      const dateLabel = document.createElement('time');
      dateLabel.className = 'card-date';
      dateLabel.dateTime = new Date(entry.createdAt).toISOString();
      dateLabel.textContent = date;
      top.append(moodLabel, dateLabel);

      const note = document.createElement('p');
      note.className = 'card-note';
      if (entry.note) note.textContent = entry.note;
      else {
        note.classList.add('is-empty');
        note.textContent = 'A little feeling, saved.';
      }

      const bottom = document.createElement('div');
      bottom.className = 'card-bottom';
      const timeLabel = document.createElement('span');
      timeLabel.className = 'card-time';
      timeLabel.textContent = `Added at ${time}`;
      const remove = document.createElement('button');
      remove.className = 'delete-button';
      remove.type = 'button';
      remove.setAttribute('aria-label', `Delete ${mood.label} entry from ${date}`);
      remove.title = 'Delete this entry';
      remove.textContent = '×';
      remove.addEventListener('click', () => {
        entries = entries.filter((item) => item.id !== entry.id);
        saveEntries();
        render();
      });
      bottom.append(timeLabel, remove);
      card.append(top, note, bottom);
      entriesEl.append(card);
    });
    countEl.textContent = String(entries.length);
    emptyState.hidden = entries.length > 0;
  }

  document.querySelectorAll('.mood-option').forEach((button) => {
    button.addEventListener('click', () => {
      selectedMood = button.dataset.mood;
      document.querySelectorAll('.mood-option').forEach((option) => {
        const active = option === button;
        option.classList.toggle('selected', active);
        option.setAttribute('aria-pressed', String(active));
      });
    });
  });

  noteInput.addEventListener('input', () => {
    countLabel.textContent = `${noteInput.value.length} / 180`;
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    entries.unshift({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      mood: selectedMood,
      note: noteInput.value.trim(),
      createdAt: new Date().toISOString()
    });
    saveEntries();
    render();
    form.reset();
    countLabel.textContent = '0 / 180';
    noteInput.focus();
  });

  document.querySelector('#today-date').textContent = new Intl.DateTimeFormat(undefined, {
    weekday: 'long', month: 'long', day: 'numeric'
  }).format(new Date());
  render();
})();
