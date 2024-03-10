const div_content = document.getElementById("content");
const div_hold = document.getElementById("hold");
const div_level = document.getElementById("level");
const div_score = document.getElementById("score");
const div_deleted_line_number = document.getElementById("deleted_line_number");
const div_time_label = document.getElementById("time_label");
const span_message = document.getElementById("message");
const div_start = document.getElementById("start");
const div_pause = document.getElementById("pause");
const div_resume = document.getElementById("resume");
const div_reset = document.getElementById("reset");
const div_game_over_show = document.getElementById("game_over_show");
const div_holds_wrapper = document.getElementById("holds_wrapper");
const div_info_wrapper = document.getElementById("info_wrapper");
const div_field = document.getElementById("field");
const div_nexts_wrapper = document.getElementById("nexts_wrapper");
const div_pause_wrapper = document.getElementById("pause_wrapper");

const div_setting = document.getElementById("setting");

const next_number = 6;

/**@type {[[HTMLDivElement]]} */
let div_cells = [];
/**@type {[[HTMLDivElement]]} */
let div_cell_borders = [];
/**@type {[[[HTMLDivElement]]]} */
let next_cells = [];
/**@type {[[HTMLDivElement]]} */
let hold_cells = [];

let keys_left_move = new Set(["a", "ArrowLeft"]);
let keys_right_move = new Set(["d", "ArrowRight"]);
let keys_left_rotate = new Set(["q"]);
let keys_right_rotate = new Set(["e"]);
let keys_soft_drop = new Set(["s"]);
let keys_hard_drop = new Set([" "]);
let keys_hold = new Set(["Shift"]);
let keys_start_pause_resume = new Set(["f"]);


// TODO: T-spin, BTB, REN の実装
//       auto repeat の実装


function init () {
  for (let i = 0; i <= 24; i++) {
    let div_cell_row = [];
    let div_cell_border_row = [];
    let cell_status_row = [];
    let cell_color_row = [];
    for (let j = 0; j <= 11; j++) {
      let my_cell_border = document.createElement("div");
      my_cell_border.classList.add("cell_border");
      if (i <= 0 || i >= 22 || j <= 0 || j >= 11) {
        my_cell_border.style.display = "none";
      }else{
        my_cell_border.style.gridRow = String(22 - i);
        my_cell_border.style.gridColumn = String(j);
      }
      if (i === 21) {
        my_cell_border.style.borderTopStyle = "none";
      }
      div_cell_border_row.push(my_cell_border);
      
      let my_cell = document.createElement("div");
      my_cell.classList.add("cell");
      my_cell.id = "cell_" + i + "_" + j;
      div_cell_row.push(my_cell);

      my_cell_border.appendChild(my_cell);
      div_content.appendChild(my_cell_border);
      cell_status_row.push("none");
      cell_color_row.push("none");
    }
    div_cells.push(div_cell_row);
    div_cell_borders.push(div_cell_border_row);
    cell_status.push(cell_status_row);
    cell_color.push(cell_color_row);
  }
  for (let num = 1; num <= next_number; num++) {
    let target_next = document.getElementById("next" + num);
    let my_next_cells = [];
    for (let i = 0; i < 2; i++) {
      let my_next_row = [];
      for (let j = 0; j < 4; j++) {
        let target_div_border = document.createElement("div");
        target_div_border.classList.add("cell_border");
        target_div_border.style.gridRow = String(2 - i);
        target_div_border.style.gridColumn = String(j + 1);

        let target_div = document.createElement("div");
        target_div.classList.add("cell");
        target_div.id = "next_" + num + "_" + i + "_" + j;
        my_next_row.push(target_div);
        target_div_border.appendChild(target_div)
        target_next.appendChild(target_div_border);
      }
      my_next_cells.push(my_next_row);
    }
    next_cells.push(my_next_cells);
  }
  for (let i = 0; i < 4; i++) {
    let my_hold_row = [];
    for (let j = 0; j < 4; j++) {
      let target_div_border = document.createElement("div");
      target_div_border.classList.add("cell_border");
      target_div_border.style.gridRow = String(4 - i);
      target_div_border.style.gridColumn = String(j + 1);
      
      let target_div = document.createElement("div");
      target_div.classList.add("cell");
      target_div.id = "hold_" + i + "_" + j;
      my_hold_row.push(target_div);
      target_div_border.appendChild(target_div);
      div_hold.appendChild(target_div_border);
    }
    hold_cells.push(my_hold_row);
  }
  for (let i = 0; i < 4; i++) {
    ghost_pos.push([,]);
  }
  document.addEventListener("keydown", function (event) {
    let operated = false;
    if (keys_left_move.has(event.key)) {left_move(); operated = true;}
    if (keys_right_move.has(event.key)) {right_move(); operated = true;}
    if (operated) {
      if (game_status !== "standby" && game_status !== "ready" && game_status !== "finish") {
        event.preventDefault();
      }
    }
    if (event.repeat) return;
    if (keys_left_rotate.has(event.key)) {left_rotate(); operated = true;}
    if (keys_right_rotate.has(event.key)) {right_rotate(); operated = true;}
    if (keys_soft_drop.has(event.key)) {soft_drop_start(); operated = true;}
    if (keys_hard_drop.has(event.key)) {hard_drop(); operated = true;}
    if (keys_hold.has(event.key)) {hold(); operated = true;}
    if (keys_start_pause_resume.has(event.key)) {start_pause_resume(); operated = true;}
    if (operated) {
      if (game_status !== "standby" && game_status !== "ready" && game_status !== "finish") {
        event.preventDefault();
      }
    }
  });
  document.addEventListener("keyup", function (event) {
    if (keys_soft_drop.has(event.key)) soft_drop_end();
  });
  document.addEventListener("mousedown", function (event) {
    if (keys_left_move.has("ボタン" + event.button)) left_move();
    if (keys_right_move.has("ボタン" + event.button)) right_move();
    if (keys_left_rotate.has("ボタン" + event.button)) left_rotate();
    if (keys_right_rotate.has("ボタン" + event.button)) right_rotate();
    if (keys_soft_drop.has("ボタン" + event.button)) soft_drop_start();
    if (keys_hard_drop.has("ボタン" + event.button)) hard_drop();
    if (keys_hold.has("ボタン" + event.button)) hold();
    if (keys_start_pause_resume.has("ボタン" + event.button)) start_pause_resume();
  });
  document.addEventListener("mouseup", function (event) {
    if (keys_soft_drop.has("ボタン" + event.button)) soft_drop_end();
  });
  document.addEventListener("contextmenu", function (event) {
    if (game_status !== "finish" && game_status !== "ready" && game_status !== "standby") {
      if (keys_left_move.has("ボタン2")) {event.preventDefault();return;}
      if (keys_right_move.has("ボタン2")) {event.preventDefault();return;}
      if (keys_left_rotate.has("ボタン2")) {event.preventDefault();return;}
      if (keys_right_rotate.has("ボタン2")) {event.preventDefault();return;}
      if (keys_soft_drop.has("ボタン2")) {event.preventDefault();return;}
      if (keys_hard_drop.has("ボタン2")) {event.preventDefault();return;}
      if (keys_hold.has("ボタン2")) {event.preventDefault();return;}
      if (keys_start_pause_resume.has("ボタン2")) {event.preventDefault();return;}
    }
  });
  div_start.addEventListener("click", start_game);
  div_pause.addEventListener("click", pause_request);
  div_resume.addEventListener("click", resume);
  div_reset.addEventListener("click", reset);
  div_game_over_show.addEventListener("click", game_over_show);
  div_setting.addEventListener("click", function (event) {
    setting_show();
  });

  window.addEventListener("blur", function (event) {
    if (game_status === "dropping" || game_status === "juding" || game_status === "rolling") {
      let current_time = new Date().getTime();
      if (resume_time + 5000 > current_time) {
        setTimeout(() => {
          if (!document.hasFocus()) {
            no_pause_message = true;
            pause_request();
            add_message("ウィンドウが非アクティブになったため、一時停止しました。");
          }
        }, resume_time + 5100 - current_time);
      }else{
        no_pause_message = true;
        pause_request();
        add_message("ウィンドウが非アクティブになったため、一時停止しました。");
      }
    }
  });
}



/**
 * @typedef Tetromino
 * @type {"I"|"J"|"L"|"O"|"Z"|"S"|"T"}
 */

/**
 * @typedef Color
 * @type {"cyan"|"blue"|"orange"|"yellow"|"red"|"green"|"purple"}
 */

const shapeI = [[0,0],[0,1],[0,2],[0,3]];
const shapeJ = [[0,1],[0,0],[0,2],[1,0]];
const shapeL = [[0,1],[0,0],[0,2],[1,2]];
const shapeO = [[0,1],[0,2],[1,1],[1,2]];
const shapeZ = [[0,1],[0,2],[1,0],[1,1]];
const shapeS = [[0,1],[0,0],[1,1],[1,2]];
const shapeT = [[0,1],[0,0],[0,2],[1,1]];
/**
 * における形を表す
 * @type {{Tetromino: [[number]]}} 
 */
const shapes = {
  "I": shapeI,
  "J": shapeJ,
  "L": shapeL,
  "O": shapeO,
  "Z": shapeZ,
  "S": shapeS,
  "T": shapeT
};
/**@type {Set<Tetromino>} */
const minos = new Set(["I","J","L","O","Z","S","T"]);

let dropping_pos = [];
/**@type {""|Tetromino} */
let dropping_mino = "";
/**@type {"a"|"b"|"c"|"d"} */
let dropping_orientation = "";
let dropping_lowest_row = 21;
/**@type {[["none"|"block"|"dropping"]]} */
let cell_status = [];
/**@type {[["none"|Color]]} */
let cell_color = [];

/**@type {"standby"|"ready"|"dropping"|"rolling"|"juding"|"finish"|"pause"} */
let game_status = "standby";
let start_time;
/**次の落下の時間 */
let next_drop_time;
/**ドロップの間隔 */
let base_drop_interval = 1000;
/**ソフトドロップ時に変化する */
let drop_interval = 1000;
let soft_dropping = false;

/**@type {[Tetromino]} */
let next_mino = [];
let can_hold = true;
/**@type {""|Tetromino} */
let hold_mino = "";
let remaining_number_of_roll = 15;
/**@type {[[number]]} */
let ghost_pos = [];
let score = 0;
let level = 1;

let initial_level = 1;
let level_up_line_number = 10;
let deleted_line_count = 0;  // レベルアップ後の消したライン数
let deleted_line_number = 0; // 消したライン数
let single_score_base = 0;
let single_score_multi = 100; // score = base + (multi * level)
let double_score_base = 0;
let double_score_multi = 300;
let triple_score_base = 0;
let triple_score_multi = 500;
let tetris_score_base = 0;
let tetris_score_multi = 800;
let initial_drop_time = 1000;
let time_decrease_num = 0;
let time_decrease_multi = 0.8;
let soft_drop_score = 1;
let hard_drop_score = 2;

let tick_func_interval;

function prepare_game () {
  if (game_status === "standby" || game_status === "finish" || game_status === "ready") {
    level = initial_level;
    base_drop_interval = initial_drop_time;
    drop_interval = base_drop_interval;
    deleted_line_count = 0;
    deleted_line_number = 0;
    dropping_pos = [];
    dropping_mino = "";
    for (let i = 0; i <= 24; i++) {
      for (let j = 0; j <= 11; j++) {
        if (i <= 0 || i >= 24 || j <= 0 || j >= 11) {
          cell_status[i][j] = "block";
        }else{
          cell_status[i][j] = "none";
        }
        cell_color[i][j] = "none";
      }
    }
    //start_time = undefined;
    next_drop_time = undefined;
    next_mino = generate_next();
    can_hold = true;
    hold_mino = "";
    score = 0;
    //reflect_next();
    game_status = "ready";
    //reflect_display();
    reflect_reset();
    div_start.style.display = null;
    div_pause.style.display = "none";
    div_resume.style.display = "none";
    div_reset.style.display = "none";
    div_game_over_show.style.display = "none";
  }
}

function start_game () {
  if (game_status === "ready") {
    start_time = new Date().getTime();
    resume_time = start_time;
    next_drop_time = start_time + drop_interval;
    message_clear();
    add_message("ゲーム開始");
    generate_mino();
    tick_func_interval = setInterval(tick_func, 10);
    div_start.style.display = "none";
    div_pause.style.display = null;
    div_resume.style.display = "none";
    div_reset.style.display = "none";
  }
}

function tick_func () {
  let current_time = new Date().getTime();
  if (game_status === "dropping" || game_status === "rolling") {
    if (pause_requesting) {
      pause_requesting = false;
      pause();
    }
    while (next_drop_time <= current_time) {
      if (game_status === "dropping") {
        drop();
      }else if (game_status === "rolling") {
        lock();
      }
      if (game_status === "dropping") {
        next_drop_time += drop_interval;
      }else if (game_status === "rolling") {
        next_drop_time = current_time + 500;
      }
      if (game_status === "finish" || game_status === "pause") break;
    }
  }
  reflect_display();
}

function generate_mino () {
  if (game_status === "juding" || game_status === "ready") {
    // 負け判定は generate_minoB へ
    let my_mino = next_mino.shift();
    if (next_mino.length < 6) {
      next_mino = next_mino.concat(generate_next());
    }
    can_hold = true;
    reflect_next();
    generate_minoB(my_mino);
    ghost_update();
  }
}

function drop () {
  if (game_status === "dropping") {
    //console.log("drop");
    for (let i = 0; i < 4; i++) {
      cell_status[dropping_pos[i][0]][dropping_pos[i][1]] = "none";
      cell_color[dropping_pos[i][0]][dropping_pos[i][1]] = "none";
    }
    for (let i = 0; i < 4; i++) {
      dropping_pos[i][0] = dropping_pos[i][0] - 1;
    }
    let target_color = get_color(dropping_mino);
    for (let i = 0; i < 4; i++) {
      cell_status[dropping_pos[i][0]][dropping_pos[i][1]] = "dropping";
      cell_color[dropping_pos[i][0]][dropping_pos[i][1]] = target_color;
    }
    if (soft_dropping) {
      score += soft_drop_score;
    }
    if (is_rolling()) {
      game_status = "rolling";
    }
    after_roll_func();
  }
}

/**
 * 遊び時間リセット、残り転がし数調整を行う
 */
function before_roll_func () {
  if (game_status === "rolling") {
    if (remaining_number_of_roll > 0) {  
      remaining_number_of_roll--;
      next_drop_time = new Date().getTime() + 500;
    }
  }
}

/**
 * 最下行の更新、残り転がし数のリセットをする。
 * 残り転がし数が 0 の時固定する。
 */
function after_roll_func () {
  if (game_status === "dropping" || game_status === "rolling") {
    let lowest_row = 21;
    for (let i = 0; i < 4; i++) {
      if (dropping_pos[i][0] < lowest_row) {
        lowest_row = dropping_pos[i][0];
      }
    }
    if (lowest_row < dropping_lowest_row) {
      dropping_lowest_row = lowest_row;
      remaining_number_of_roll = 15;
    }
  }
  if (game_status === "rolling") {
    if (remaining_number_of_roll <= 0) {
      lock();
    }
  }
}

function right_move () {
  if (game_status === "dropping" || game_status === "rolling") {
    for (let i = 0; i < 4; i++) {
      if (cell_status[dropping_pos[i][0]][dropping_pos[i][1] + 1] === "block") {
        return;
      }
    }
    //console.log("right move");

    before_roll_func();
    for (let i = 0; i < 4; i++) {
      cell_status[dropping_pos[i][0]][dropping_pos[i][1]] = "none";
      cell_color[dropping_pos[i][0]][dropping_pos[i][1]] = "none";
    }
    let target_color = get_color(dropping_mino);
    for (let i = 0; i < 4; i++) {
      dropping_pos[i][1]++;
      cell_status[dropping_pos[i][0]][dropping_pos[i][1]] = "dropping";
      cell_color[dropping_pos[i][0]][dropping_pos[i][1]] = target_color;
    }
    if (is_rolling()) {
      game_status = "rolling";
    }else{
      game_status = "dropping";
    }
    after_roll_func();
    ghost_update();
  }
}

function left_move () {
  if (game_status === "dropping" || game_status === "rolling") {
    for (let i = 0; i < 4; i++) {
      if (cell_status[dropping_pos[i][0]][dropping_pos[i][1] - 1] === "block") {
        return;
      }
    }
    //console.log("left move");
    
    before_roll_func();
    for (let i = 0; i < 4; i++) {
      cell_status[dropping_pos[i][0]][dropping_pos[i][1]] = "none";
      cell_color[dropping_pos[i][0]][dropping_pos[i][1]] = "none";
    }
    let target_color = get_color(dropping_mino);
    for (let i = 0; i < 4; i++) {
      dropping_pos[i][1]--;
      cell_status[dropping_pos[i][0]][dropping_pos[i][1]] = "dropping";
      cell_color[dropping_pos[i][0]][dropping_pos[i][1]] = target_color;
    }
    if (is_rolling()) {
      game_status = "rolling";
    }else{
      game_status = "dropping";
    }
    after_roll_func();
    ghost_update();
  }
}

function right_rotate () {
  if (game_status === "dropping" || game_status === "rolling") {
    let after_rotate;
    let can_rotate = true;
    for (let index = 0; index <= 4; index++) {
      after_rotate = right_rotateB(dropping_mino, dropping_pos, dropping_orientation, index);
      can_rotate = true;
      for (let i = 0; i < 4; i++) {
        if (after_rotate[i][0] < 0 || after_rotate[i][0] > 24 || after_rotate[i][1] < 0 ||after_rotate[i][1] > 11) {
          // 結局境界処理することになってしまった
          can_rotate = false;
          break;
        }
        if (cell_status[after_rotate[i][0]][after_rotate[i][1]] === "block") { // 補完 ?
          can_rotate = false;
          break;
        }
      }
      if (can_rotate) {
        break;
      }
    }
    if (!can_rotate) return;

    before_roll_func();
    for (let i = 0; i < 4; i++) {
      cell_status[dropping_pos[i][0]][dropping_pos[i][1]] = "none";
      cell_color[dropping_pos[i][0]][dropping_pos[i][1]] = "none";
    }
    dropping_orientation = orientation_rotate("right", dropping_orientation);
    let target_color = get_color(dropping_mino);
    for (let i = 0; i < 4; i++) {
      dropping_pos[i][0] = after_rotate[i][0];
      dropping_pos[i][1] = after_rotate[i][1];
      cell_status[dropping_pos[i][0]][dropping_pos[i][1]] = "dropping";
      cell_color[dropping_pos[i][0]][dropping_pos[i][1]] = target_color;
    }
    if (is_rolling()) {
      game_status = "rolling";
    }else{
      game_status = "dropping";
    }
    after_roll_func();
    ghost_update();
  }
}

function left_rotate () {
  if (game_status === "dropping" || game_status === "rolling") {
    let after_rotate;
    let can_rotate = true;
    for (let index = 0; index <= 4; index++) {
      after_rotate = left_rotateB(dropping_mino, dropping_pos, dropping_orientation, index);
      can_rotate = true;
      for (let i = 0; i < 4; i++) {
        if (after_rotate[i][0] < 0 || after_rotate[i][0] > 24 || after_rotate[i][1] < 0 ||after_rotate[i][1] > 11) {
          // 結局境界処理することになってしまった
          can_rotate = false;
          break;
        }
        if (cell_status[after_rotate[i][0]][after_rotate[i][1]] === "block") { // 補完 ?
          can_rotate = false;
          break;
        }
      }
      if (can_rotate) {
        break;
      }
    }
    if (!can_rotate) return;

    before_roll_func();
    for (let i = 0; i < 4; i++) {
      cell_status[dropping_pos[i][0]][dropping_pos[i][1]] = "none";
      cell_color[dropping_pos[i][0]][dropping_pos[i][1]] = "none";
    }
    dropping_orientation = orientation_rotate("left", dropping_orientation);
    let target_color = get_color(dropping_mino);
    for (let i = 0; i < 4; i++) {
      dropping_pos[i][0] = after_rotate[i][0];
      dropping_pos[i][1] = after_rotate[i][1];
      cell_status[dropping_pos[i][0]][dropping_pos[i][1]] = "dropping";
      cell_color[dropping_pos[i][0]][dropping_pos[i][1]] = target_color;
    }
    if (is_rolling()) {
      game_status = "rolling";
    }else{
      game_status = "dropping";
    }
    after_roll_func();
    ghost_update();
  }
}

function hold () {
  if (game_status === "dropping" || game_status === "rolling") {
    if (can_hold) {
      if (hold_mino === "") {
        for (let i = 0; i < 4; i++) {
          cell_status[dropping_pos[i][0]][dropping_pos[i][1]] = "none";
          cell_color[dropping_pos[i][0]][dropping_pos[i][1]] = "none";
        }
        hold_mino = dropping_mino;
        game_status = "juding";
        generate_mino();
        can_hold = false;
        reflect_hold()
      }else{
        let new_hold_mino = dropping_mino;
        for (let i = 0; i < 4; i++) {
          cell_status[dropping_pos[i][0]][dropping_pos[i][1]] = "none";
          cell_color[dropping_pos[i][0]][dropping_pos[i][1]] = "none";
        }
        generate_minoB(hold_mino);
        hold_mino = new_hold_mino;
        can_hold = false;
        reflect_hold();
        ghost_update();
      }
    }else{
      console.log("cannot hold!");
    }
  }
}

function soft_drop_start () {
  if (soft_dropping) return;
  soft_dropping = true;
  if (game_status === "dropping" || game_status === "rolling") {
    drop_interval = base_drop_interval / 20;
    if (game_status === "dropping") {
      let my_drop_time = new Date().getTime() + drop_interval;
      if (my_drop_time < next_drop_time) {
        next_drop_time = my_drop_time;
      }
    }
  }
}

function soft_drop_end () {
  if (!soft_dropping) return;
  soft_dropping = false;
  if (game_status === "dropping" || game_status === "rolling") {
    if (game_status === "dropping") {
      next_drop_time = next_drop_time + (drop_interval * 19);
    }
    drop_interval = base_drop_interval;
  }
}

function hard_drop () {
  if (game_status === "dropping" || game_status === "rolling") {
    ghost_update();
    let drop_number = dropping_pos[0][0] - ghost_pos[0][0];
    for (let i = 0; i < 4; i++) {
      cell_status[dropping_pos[i][0]][dropping_pos[i][1]] = "none";
      cell_color[dropping_pos[i][0]][dropping_pos[i][1]] = "none";
      dropping_pos[i][0] = ghost_pos[i][0];
      dropping_pos[i][1] = ghost_pos[i][1];
      cell_status[dropping_pos[i][0]][dropping_pos[i][1]] = "dropping";
      cell_color[dropping_pos[i][0]][dropping_pos[i][1]] = get_color(dropping_mino);
    }
    score += drop_number * hard_drop_score;
    game_status = "rolling";
    lock();
  }
}

function lock () {
  if (game_status === "rolling") {
    //console.log("lock!");
    let is_game_over = true;
    for (let i = 0; i < 4; i++) {
      cell_status[dropping_pos[i][0]][dropping_pos[i][1]] = "block";
      if (dropping_pos[i][0] <= 20) is_game_over = false;
    }
    soft_drop_end();
    if (is_game_over) {
      game_over();
      return;
    }
    game_status = "juding";
    delete_line();
  }
}

function delete_line () {
  let my_delete_line_num = 0;
  if (game_status === "juding") {
    for (let i = 22; i >= 1; i--) {
      let can_delete = true;
      for (let j = 1; j <= 10; j++) {
        if (cell_status[i][j] !== "block") {
          can_delete = false;
          break;
        }
      }
      if (can_delete) {
        delete_lineB(i);
        my_delete_line_num++;
      }
    }
    deleted_line_number += my_delete_line_num;
    deleted_line_count += my_delete_line_num;
    while (true) {
      if (deleted_line_count >= level_up_line_number) {
        level++;
        deleted_line_count -= level_up_line_number;
        base_drop_interval = base_drop_interval - time_decrease_num;
        base_drop_interval = base_drop_interval * time_decrease_multi;
        drop_interval = base_drop_interval;
        add_message(`levelが上昇(${level - 1}→${level})`);
      }else{
        break;
      }
    }
    let gained_score = 0;
    if (my_delete_line_num === 1) {
      gained_score = single_score_base + single_score_multi * level;
    }else if (my_delete_line_num === 2) {
      gained_score = double_score_base + double_score_multi * level;
    }else if (my_delete_line_num === 3) {
      gained_score = triple_score_base + triple_score_multi * level;
    }else if (my_delete_line_num === 4) {
      gained_score = tetris_score_base + tetris_score_multi * level;
    }
    if (my_delete_line_num !== 0) {
      score += gained_score;
      add_message(my_delete_line_num + `段消し達成`);
      add_message(`スコア ${gained_score} を獲得`);
    }
    generate_mino();
  }
}

function ghost_update () {
  if (dropping_pos.length < 4) return;
  for (let i = 0; i < 4; i++) {
    ghost_pos[i][0] = dropping_pos[i][0];
    ghost_pos[i][1] = dropping_pos[i][1];
  }
  do {
    let flag = false;
    for (let i = 0; i < 4; i++) {
      if (cell_status[ghost_pos[i][0] - 1][ghost_pos[i][1]] === "block") {
        flag = true;
        break;
      }
    }
    if (flag) break;
    for (let i = 0; i < 4; i++) {
      ghost_pos[i][0]--;
    }
  } while (true);
  reflect_ghost();
} 

function game_over () {
  if (game_status === "finish") return;
  game_status = "finish";
  //console.log("game over!");
  add_message("ゲームオーバー")
  clearInterval(tick_func_interval);
  setTimeout(() => {
    game_over_show();
  }, 500);
  div_start.style.display = "none";
  div_pause.style.display = "none";
  div_resume.style.display = "none";
  div_reset.style.display = null;
  div_game_over_show.style.display = null;
}

let pause_requesting = false;
function pause_request () {
  if (game_status !== "standby" && game_status !== "ready" && game_status !== "finish") {
    pause_requesting = true;
  }
}

/**次の落下までの時間, 一時停止時に使用 */
let next_drop_interval_time = 0;
let old_game_status;
let pause_time;
let resume_time;
let no_pause_message = false;
function pause () {
  if (game_status === "dropping" || game_status === "rolling") {
    let current_time = new Date().getTime();
    if (current_time - resume_time < 5000) {
      add_message("現在一時停止できません。(" + ((resume_time + 5000 - current_time) / 1000) + "秒後に可能)");
      return;
    }
    pause_time = current_time;
    soft_drop_end();
    clearInterval(tick_func_interval);
    next_drop_interval_time = next_drop_time - current_time;
    old_game_status = game_status;
    game_status = "pause";
    // UI 調整
    div_holds_wrapper.style.display = "none";
    div_info_wrapper.style.display = "none";
    div_field.style.display = "none";
    div_nexts_wrapper.style.display = "none";
    div_pause_wrapper.style.display = "block";

    div_start.style.display = "none";
    div_pause.style.display = "none";
    div_resume.style.display = null;
    div_reset.style.display = null;
    if (no_pause_message) {
      no_pause_message = false;
    }else{
      add_message("一時停止しました。");
    }
    
  }
}

function resume () {
  if (game_status === "pause") {
    // UI 調整
    div_holds_wrapper.style.display = null;
    div_info_wrapper.style.display = null;
    div_field.style.display = null;
    div_nexts_wrapper.style.display = null;
    div_pause_wrapper.style.display = null;

    let current_time = new Date().getTime();
    next_drop_time = current_time + next_drop_interval_time;
    resume_time = current_time;
    start_time += current_time - pause_time;
    game_status = old_game_status;
    tick_func_interval = setInterval(tick_func, 10);
    div_start.style.display = "none";
    div_pause.style.display = null;
    div_resume.style.display = "none";
    div_reset.style.display = "none";
    add_message("再開しました。");
  }
}

/**
 * start, pause_request, resume のうち適切なものを行う
 */
function start_pause_resume () {
  if (game_status === "ready") {
    start_game();
  }else if (game_status === "pause") {
    resume();
  }else{
    pause_request();
  }
}

function reset () {
  if (game_status === "pause" || game_status === "finish") {
    if (game_status === "pause") {
      if (window.confirm("リセットすると、現在のプレイ状況が失われます。リセットしますか？")) {
        game_status = "finish";
      }else{
        return;
      }
    }else{
      if (window.confirm("リセットすると、プレイの結果が失われます。リセットしますか？")) {
      }else{
        return;
      }
    }
    message_clear();
    prepare_game();
    div_holds_wrapper.style.display = null;
    div_info_wrapper.style.display = null;
    div_field.style.display = null;
    div_nexts_wrapper.style.display = null;
    div_pause_wrapper.style.display = null;

    div_start.style.display = null;
    div_pause.style.display = "none";
    div_resume.style.display = "none";
    div_reset.style.display = "none";
  }
}


/**
 * 
 * @param {Tetromino}  mino        ミノの種類
 * @param {[[number]]} mino_pos    ミノの位置
 * @param {string}     orientation ミノの向き
 * @param {number}     index       回転のインデックス
 * @returns {[[number]]}     回転後の位置
 */
function right_rotateB (mino, mino_pos, orientation, index) {
  if (mino === "O") {
    return mino_pos.concat();
  }else if (mino === "I") {
    let rotation_center = [,];
    switch (orientation) {
      case "a":
        rotation_center[0] = mino_pos[0][0] - 0.5;
        rotation_center[1] = mino_pos[0][1] + 1.5;
        break;
      case "b":
        rotation_center[0] = mino_pos[0][0] - 1.5;
        rotation_center[1] = mino_pos[0][1] - 0.5;
        break;
      case "c":
        rotation_center[0] = mino_pos[0][0] + 0.5;
        rotation_center[1] = mino_pos[0][1] - 1.5;
        break;
      case "d":
        rotation_center[0] = mino_pos[0][0] + 1.5;
        rotation_center[1] = mino_pos[0][1] + 0.5;
        break;
    }
    let relative_pos = mino_pos.map(elem => ([elem[0] - rotation_center[0], elem[1] - rotation_center[1]]));
    relative_pos = relative_pos.map(elem => right_rotateC(elem)); // 基本回転

    if ((orientation === "a" && index === 1) || 
        (orientation === "d" && index === 1) || 
        (orientation === "a" && index === 3) || 
        (orientation === "d" && index === 4)) {
      relative_pos = relative_pos.map(elem => [elem[0], elem[1] - 2]); // 左2

    }else if ((orientation === "b" && index === 1) || 
              (orientation === "c" && index === 2) || 
              (orientation === "b" && index === 3) || 
              (orientation === "c" && index === 4)) {
      relative_pos = relative_pos.map(elem => [elem[0], elem[1] - 1]); // 左1

    }else if ((orientation === "a" && index === 2) || 
              (orientation === "d" && index === 2) || 
              (orientation === "d" && index === 3) || 
              (orientation === "a" && index === 4)) {
      relative_pos = relative_pos.map(elem => [elem[0], elem[1] + 1]); // 右1

    }else if ((orientation === "c" && index === 1) || 
              (orientation === "b" && index === 2) || 
              (orientation === "c" && index === 3) || 
              (orientation === "b" && index === 4)) {
      relative_pos = relative_pos.map(elem => [elem[0], elem[1] + 2]); // 右2
    }
    

    if ((orientation === "c" && index === 4) || 
        (orientation === "d" && index === 3)) {
      relative_pos = relative_pos.map(elem => [elem[0] - 2, elem[1]]); // 下2

    }else if ((orientation === "a" && index === 3) || 
              (orientation === "b" && index === 4)) {
      relative_pos = relative_pos.map(elem => [elem[0] - 1, elem[1]]); // 下1

    }else if ((orientation === "c" && index === 3) || 
              (orientation === "d" && index === 4)) {
      relative_pos = relative_pos.map(elem => [elem[0] + 1, elem[1]]); // 上1

    }else if ((orientation === "a" && index === 4) || 
              (orientation === "b" && index === 3)) {
      relative_pos = relative_pos.map(elem => [elem[0] + 2, elem[1]]); // 上2
    }

    return relative_pos.map(elem => ([elem[0] + rotation_center[0], elem[1] + rotation_center[1]]));
  }else{
    let rotation_center = [mino_pos[0][0],mino_pos[0][1]];
    let relative_pos = mino_pos.map(elem => ([elem[0] - rotation_center[0], elem[1] - rotation_center[1]]));
    relative_pos = relative_pos.map(elem => right_rotateC(elem)); // 基本回転
    if (index === 1 || index === 2) {
      switch (orientation) {
        case "a":case "d":
          relative_pos = relative_pos.map(elem => [elem[0], elem[1] - 1]);
          break;
        case "b":case "c":
          relative_pos = relative_pos.map(elem => [elem[0], elem[1] + 1]);
          break;
      }
      if (index === 2) {
        switch (orientation) {
          case "a":case "c":
            relative_pos = relative_pos.map(elem => [elem[0] + 1, elem[1]]);
            break;
          case "b":case "d":
            relative_pos = relative_pos.map(elem => [elem[0] - 1, elem[1]]);
            break;
        }
      }
    }else if (index === 3 || index === 4) {
      switch (orientation) {
        case "a":case "c":
          relative_pos = relative_pos.map(elem => [elem[0] - 2, elem[1]]);
          break;
        case "b":case "d":
          relative_pos = relative_pos.map(elem => [elem[0] + 2, elem[1]]);
          break;
      }
      if (index === 4) {
        switch (orientation) {
          case "a":case "d":
            relative_pos = relative_pos.map(elem => [elem[0], elem[1] - 1]);
            break;
          case "b":case "c":
            relative_pos = relative_pos.map(elem => [elem[0], elem[1] + 1]);
            break;
        }
      }
    }
    return relative_pos.map(elem => ([elem[0] + rotation_center[0], elem[1] + rotation_center[1]]));
  }
}

/**
 * 
 * @param {Tetromino} mino 
 * @param {[[number]]} mino_pos 
 * @param {string} orientation 
 * @param {number} index 
 * @returns {[[number]]}
 */
function left_rotateB (mino, mino_pos, orientation, index) {
  if (mino === "O") {
    return mino_pos.concat();
  }else if (mino === "I") {
    let rotation_center = [,];
    switch (orientation) {
      case "a":
        rotation_center[0] = mino_pos[0][0] - 0.5;
        rotation_center[1] = mino_pos[0][1] + 1.5;
        break;
      case "b":
        rotation_center[0] = mino_pos[0][0] - 1.5;
        rotation_center[1] = mino_pos[0][1] - 0.5;
        break;
      case "c":
        rotation_center[0] = mino_pos[0][0] + 0.5;
        rotation_center[1] = mino_pos[0][1] - 1.5;
        break;
      case "d":
        rotation_center[0] = mino_pos[0][0] + 1.5;
        rotation_center[1] = mino_pos[0][1] + 0.5;
        break;
    }
    let relative_pos = mino_pos.map(elem => ([elem[0] - rotation_center[0], elem[1] - rotation_center[1]]));
    relative_pos = relative_pos.map(elem => left_rotateC(elem)); // 基本回転

    if ((orientation === "c" && index === 2) || 
        (orientation === "d" && index === 2) || 
        (orientation === "d" && index === 3) || 
        (orientation === "c" && index === 4)) {
      relative_pos = relative_pos.map(elem => [elem[0], elem[1] - 2]); // 左2

    }else if ((orientation === "a" && index === 1) || 
              (orientation === "b" && index === 2) || 
              (orientation === "a" && index === 3) || 
              (orientation === "b" && index === 4)) {
      relative_pos = relative_pos.map(elem => [elem[0], elem[1] - 1]); // 左1

    }else if ((orientation === "c" && index === 1) || 
              (orientation === "d" && index === 1) || 
              (orientation === "c" && index === 3) || 
              (orientation === "d" && index === 4)) {
      relative_pos = relative_pos.map(elem => [elem[0], elem[1] + 1]); // 右1

    }else if ((orientation === "b" && index === 1) || 
              (orientation === "a" && index === 2) || 
              (orientation === "b" && index === 3) || 
              (orientation === "a" && index === 4)) {
      relative_pos = relative_pos.map(elem => [elem[0], elem[1] + 2]); // 右2
    }
    

    if ((orientation === "c" && index === 3) || 
        (orientation === "b" && index === 4)) {
      relative_pos = relative_pos.map(elem => [elem[0] - 2, elem[1]]); // 下2

    }else if ((orientation === "d" && index === 3) || 
              (orientation === "a" && index === 4)) {
      relative_pos = relative_pos.map(elem => [elem[0] - 1, elem[1]]); // 下1

    }else if ((orientation === "b" && index === 3) || 
              (orientation === "c" && index === 4)) {
      relative_pos = relative_pos.map(elem => [elem[0] + 1, elem[1]]); // 上1

    }else if ((orientation === "a" && index === 3) || 
              (orientation === "d" && index === 4)) {
      relative_pos = relative_pos.map(elem => [elem[0] + 2, elem[1]]); // 上2
    }
    
    return relative_pos.map(elem => ([elem[0] + rotation_center[0], elem[1] + rotation_center[1]]));
  }else{
    let rotation_center = [mino_pos[0][0],mino_pos[0][1]];
    let relative_pos = mino_pos.map(elem => ([elem[0] - rotation_center[0], elem[1] - rotation_center[1]]));
    relative_pos = relative_pos.map(elem => left_rotateC(elem)); // 基本回転
    if (index === 1 || index === 2) {
      switch (orientation) {
        case "c":case "d":
          relative_pos = relative_pos.map(elem => [elem[0], elem[1] - 1]);
          break;
        case "a":case "b":
          relative_pos = relative_pos.map(elem => [elem[0], elem[1] + 1]);
          break;
      }
      if (index === 2) {
        switch (orientation) {
          case "a":case "c":
            relative_pos = relative_pos.map(elem => [elem[0] + 1, elem[1]]);
            break;
          case "b":case "d":
            relative_pos = relative_pos.map(elem => [elem[0] - 1, elem[1]]);
            break;
        }
      }
    }else if (index === 3 || index === 4) {
      switch (orientation) {
        case "a":case "c":
          relative_pos = relative_pos.map(elem => [elem[0] - 2, elem[1]]);
          break;
        case "b":case "d":
          relative_pos = relative_pos.map(elem => [elem[0] + 2, elem[1]]);
          break;
      }
      if (index === 4) {
        switch (orientation) {
          case "c":case "d":
            relative_pos = relative_pos.map(elem => [elem[0], elem[1] - 1]);
            break;
          case "a":case "b":
            relative_pos = relative_pos.map(elem => [elem[0], elem[1] + 1]);
            break;
        }
      }
    }
    return relative_pos.map(elem => ([elem[0] + rotation_center[0], elem[1] + rotation_center[1]]));
  }
}

/**
 * 指定した座標を [0,0] を中心に右に(時計回りに)回転する。
 * ただし、第一軸↑、第二軸→
 * @param {[number]} relative_pos 
 * @returns {[number]}
 */
function right_rotateC (relative_pos) {
  return [-relative_pos[1], relative_pos[0]];
}

/**
 * 指定した座標を [0,0] を中心に左に(反時計回りに)回転する。
 * ただし、第一軸↑、第二軸→
 * @param {[number]} relative_pos 
 * @returns {[number]}
 */
function left_rotateC (relative_pos) {
  return [relative_pos[1], -relative_pos[0]];
}

/**
 * 
 * @param {Tetromino} mino 
 */
function generate_minoB (mino) {
  dropping_orientation = "a";
  dropping_lowest_row = 21;
  remaining_number_of_roll = 15;
  dropping_mino = mino;
  dropping_pos = [];
  for (let i = 0; i < 4; i++) {
    dropping_pos.push([shapes[mino][i][0] + 21,shapes[mino][i][1] + 4]);
    if (cell_status[dropping_pos[i][0]][dropping_pos[i][1]] === "block") {
      game_over();
      return;
    }
    cell_status[dropping_pos[i][0]][dropping_pos[i][1]] = "dropping";
    cell_color[dropping_pos[i][0]][dropping_pos[i][1]] = get_color(mino);
  }
  if (is_rolling()) {
    game_status = "rolling";
  }else{
    game_status = "dropping";
  }
  
}

function delete_lineB (row) {
  for (let i = row; i < 22; i++) {
    for (let j = 1; j <= 10; j++) {
      cell_status[i][j] = cell_status[i + 1][j];
      cell_color[i][j] = cell_color[i + 1][j];
    }
  }
  for (let j = 1; j <= 10; j++) {
    cell_status[22][j] = "none";
    cell_color[22][j] = "none";
  }
}

/**
 * 接地判定
 * @returns {boolean}
 */
function is_rolling () {
  for (let i = 0; i < 4; i++) {
    if (cell_status[dropping_pos[i][0] - 1][dropping_pos[i][1]] === "block") {
      return true;
    }
  }
  return false;
}

/**
 * 7 種類のミノをランダムに並べ替えた配列を返す
 */
function generate_next () {
  let my_minos = new Set(minos);
  let new_minos = [];
  for (let i = 7; i >= 1; i--) {
    let index = Math.floor(Math.random() * i);
    let target_mino = Array.from(my_minos)[index];
    new_minos.push(target_mino);
    my_minos.delete(target_mino);
  }
  return new_minos;
}

/**
 * 
 * @param {Tetromino} mino 
 * @returns {Color}
 */
function get_color (mino) {
  switch (mino) {
    case "I":
      return "cyan";
    case "J":
      return "blue";
    case "L":
      return "orange";
    case "O":
      return "yellow";
    case "Z":
      return "red";
    case "S":
      return "green";
    case "T":
      return "purple";
  }
}

/**
 * 向きを表す記号を回転する
 * @param {string} lr          回転の方向。left, right
 * @param {string} orientation 向き。a, b, c, d
 */
function orientation_rotate (lr, orientation) {
  if (lr === "right") {
    switch (orientation) {
      case "a":
        return "b";
      case "b":
        return "c";
      case "c":
        return "d";
      case "d":
        return "a";
    }
  }else if (lr === "left") {
    switch (orientation) {
      case "a":
        return "d";
      case "b":
        return "a";
      case "c":
        return "b";
      case "d":
        return "c";
    }
  }
}


function reflect_display () {
  for (let i = 0; i <= 24; i++) {
    for (let j = 0; j <= 11; j++) {
      div_cells[i][j].classList.remove("cyan", "blue", "orange", "yellow", "red", "green", "purple");
      if (cell_color[i][j] !== "none") {
        div_cells[i][j].classList.add(cell_color[i][j]);
      }
    }
  }
  div_level.innerText = String(level);
  div_score.innerText = String(score);
  div_deleted_line_number.innerText = String(deleted_line_number);
  div_time_label.innerText = format_time(new Date().getTime() - start_time);
}
function reflect_next () {
  for (let num = 0; num < next_number; num++) {
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 4; j++) {
        next_cells[num][i][j].classList.remove("cyan", "blue", "orange", "yellow", "red", "green", "purple");
      }
    }
    let my_shape = shapes[next_mino[num]];
    for (let i = 0; i < 4; i++) {
      next_cells[num][my_shape[i][0]][my_shape[i][1]].classList.add(get_color(next_mino[num]));
    }
  }
}
function reflect_hold () {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      hold_cells[i][j].classList.remove("cyan", "blue", "orange", "yellow", "red", "green", "purple");
    }
  }
  if (hold_mino !== "") {
    let my_shape = shapes[hold_mino];
    for (let i = 0; i < 4; i++) {
      hold_cells[my_shape[i][0] + 1][my_shape[i][1]].classList.add(get_color(hold_mino));
    }
  }
}
function reflect_ghost () {
  for (let i = 0; i <= 24; i++) {
    for (let j = 0; j <= 11; j++) {
      div_cell_borders[i][j].classList.remove("ghost");
    }
  }
  if (ghost_pos.length < 4) return;
  for (let i = 0; i < 4; i++) {
    div_cell_borders[ghost_pos[i][0]][ghost_pos[i][1]].classList.add("ghost");
  }
}
function reflect_reset () {
  for (let i = 0; i <= 24; i++) {
    for (let j = 0; j <= 11; j++) {
      div_cells[i][j].classList.remove("cyan", "blue", "orange", "yellow", "red", "green", "purple");
    }
  }
  for (let num = 0; num < next_number; num++) {
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 4; j++) {
        next_cells[num][i][j].classList.remove("cyan", "blue", "orange", "yellow", "red", "green", "purple");
      }
    }
  }
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      hold_cells[i][j].classList.remove("cyan", "blue", "orange", "yellow", "red", "green", "purple");
    }
  }
  for (let i = 0; i <= 24; i++) {
    for (let j = 0; j <= 11; j++) {
      div_cell_borders[i][j].classList.remove("ghost");
    }
  }
  div_level.innerText = String(level);
  div_score.innerText = String(score);
  div_deleted_line_number.innerText = String(deleted_line_number);
}

let message_log = [];

function add_message (msg) {
  message_log.push(new Date().toLocaleTimeString() + "\t" + msg);
  let my_msg = message_log.join("\n");
  span_message.innerText = my_msg;
  if (message_log.length > 3) {
    span_message.style.top = String(3 - message_log.length) + "lh";
  }
}
function message_clear () {
  message_log = [];
  span_message.innerText = "";
  span_message.style.top = "0";
}


const div_setting_wrap = document.getElementById("setting_wrap");
const div_setting_area = document.getElementById("setting_area");
const div_setting_tab_area = document.getElementById("setting_tab_area");
const div_setting_decide_btn = document.getElementById("setting_decide_btn");
const div_setting_cancel_btn = document.getElementById("setting_cancel_btn");

const div_key_setting_body = document.getElementById("key_setting_body");

/**@type {HTMLSelectElement} */const select_cell_size = document.getElementById("cell_size");
/**@type {HTMLSelectElement} */const select_next_display_number = document.getElementById("next_display_number");
/**@type {HTMLInputElement} */const input_setting_time_display = document.getElementById("setting_time_display");
/**@type {HTMLInputElement} */const input_setting_ghost_display = document.getElementById("setting_ghost_display");

/**@type {HTMLInputElement} */const input_initial_level = document.getElementById("initial_level");
/**@type {HTMLInputElement} */const input_level_up_line_number = document.getElementById("level_up_line_number");
/**@type {HTMLInputElement} */const input_soft_drop_score = document.getElementById("soft_drop_score");
/**@type {HTMLInputElement} */const input_hard_drop_score = document.getElementById("hard_drop_score");
/**@type {HTMLInputElement} */const input_single_score_base = document.getElementById("single_score_base");
/**@type {HTMLInputElement} */const input_single_score_multi = document.getElementById("single_score_multi");
/**@type {HTMLInputElement} */const input_double_score_base = document.getElementById("double_score_base");
/**@type {HTMLInputElement} */const input_double_score_multi = document.getElementById("double_score_multi");
/**@type {HTMLInputElement} */const input_triple_score_base = document.getElementById("triple_score_base");
/**@type {HTMLInputElement} */const input_triple_score_multi = document.getElementById("triple_score_multi");
/**@type {HTMLInputElement} */const input_tetris_score_base = document.getElementById("tetris_score_base");
/**@type {HTMLInputElement} */const input_tetris_score_multi = document.getElementById("tetris_score_multi");
/**@type {HTMLInputElement} */const input_initial_drop_time = document.getElementById("initial_drop_time");
/**@type {HTMLInputElement} */const input_time_decrease_num = document.getElementById("time_decrease_num");
/**@type {HTMLInputElement} */const input_time_decrease_multi = document.getElementById("time_decrease_multi");
/**@type {HTMLInputElement} */const input_opt_decrease_num = document.getElementById("opt_decrease_num");
/**@type {HTMLInputElement} */const input_opt_decrease_multi = document.getElementById("opt_decrease_multi");

/**@type {HTMLInputElement} */const input_setting_left_move = document.getElementById("setting_left_move");
/**@type {HTMLInputElement} */const input_setting_right_move = document.getElementById("setting_right_move");
/**@type {HTMLInputElement} */const input_setting_left_rotate = document.getElementById("setting_left_rotate");
/**@type {HTMLInputElement} */const input_setting_right_rotate = document.getElementById("setting_right_rotate");
/**@type {HTMLInputElement} */const input_setting_soft_drop = document.getElementById("setting_soft_drop");
/**@type {HTMLInputElement} */const input_setting_hard_drop = document.getElementById("setting_hard_drop");
/**@type {HTMLInputElement} */const input_setting_hold = document.getElementById("setting_hold");
/**@type {HTMLInputElement} */const input_setting_start_pause_resume = document.getElementById("setting_start_pause_resume");

/**@type {HTMLDivElement} */const div_game_over_wrap = document.getElementById("game_over_wrap");
/**@type {HTMLDivElement} */const div_game_over_level = document.getElementById("game_over_level");
/**@type {HTMLDivElement} */const div_game_over_score = document.getElementById("game_over_score");
/**@type {HTMLDivElement} */const div_game_over_time = document.getElementById("game_over_time");
/**@type {HTMLTextAreaElement} */const textarea_game_over_log_body = document.getElementById("game_over_log_body");
/**@type {HTMLDivElement} */const div_game_over_close = document.getElementById("game_over_close");



let contextmenu_event_prevent = false;
let click_event_prevent = false;

function setting_init () {
  div_setting_tab_area.addEventListener("click", /**@param {MouseEvent} event */function (event) {
    if (event.target.classList.contains("setting_tab")) {
      /**@type {HTMLDivElement} */
      let target_div = event.target;
      setting_tab_select(Number(target_div.id.slice(-1)));
    }
  });
  div_setting_decide_btn.addEventListener("click", function (event) {
    setting_decide();
  });
  div_setting_cancel_btn.addEventListener("click", function (event) {
    setting_cancel();
  });
  input_opt_decrease_num.addEventListener("change", time_decrease_opt_func);
  input_opt_decrease_multi.addEventListener("change", time_decrease_opt_func);
  Array.from(div_key_setting_body.getElementsByClassName("key_register")).forEach(function (elem) {
    elem.addEventListener("click", key_register_listener);
  });
  Array.from(div_key_setting_body.getElementsByClassName("key_delete")).forEach(function (elem) {
    elem.addEventListener("click", key_delete_listener);
  });
  Array.from(div_key_setting_body.getElementsByClassName("key_reset")).forEach(function (elem) {
    elem.addEventListener("click", key_reset_listener);
  });
  document.addEventListener("keydown", function (event) {
    if (registering_input_elem === undefined) return;
    let l_key = "";
    let find_result = key_table.find(elem2 => (elem2.set === event.key));
    if (find_result === undefined) {
      l_key = event.key
    }else{
      l_key = find_result.list;
    }
    if (registering_input_elem.value === "") {
      registering_input_elem.value = l_key;
    }else{
      registering_input_elem.value = registering_input_elem.value + "," + l_key;
    }
    registering_div_label.classList.remove("registering");
    registering_input_elem = undefined;
    registering_div_label = undefined;
    event.stopPropagation();
    event.preventDefault();
  }, true);
  document.addEventListener("mousedown", function (event) {
    if (registering_input_elem === undefined) return;
    let l_key = "";
    let find_result = key_table.find(elem2 => (elem2.set === "ボタン" + event.button));
    if (find_result === undefined) {
      l_key = "ボタン" + event.button;
    }else{
      l_key = find_result.list;
    }
    if (registering_input_elem.value === "") {
      registering_input_elem.value = l_key;
    }else{
      registering_input_elem.value = registering_input_elem.value + "," + l_key;
    }
    registering_div_label.classList.remove("registering");
    registering_input_elem = undefined;
    registering_div_label = undefined;
    event.stopPropagation();
    event.preventDefault();
    if (event.button === 2) {
      contextmenu_event_prevent = true;
    }else if (event.button === 0) {
      click_event_prevent = true;
    }
  }, true);
  document.addEventListener("contextmenu", function (event) {
    if (contextmenu_event_prevent) {
      event.stopPropagation()
      event.preventDefault();
      contextmenu_event_prevent = false;
    }
  }, true);
  document.addEventListener("click", function (event) {
    if (click_event_prevent) {
      event.stopPropagation();
      event.preventDefault();
      click_event_prevent = false;
    }
  }, true);
  
  div_game_over_wrap.addEventListener("click", function (event) {
    if (event.target === event.currentTarget) {
      game_over_hide();
    }
  });
  div_game_over_close.addEventListener("click", function (event) {
    game_over_hide();
  });
  game_over_hide();
  
}

function setting_tab_select (tab_number) {
  div_setting_area.classList.remove("tab1","tab2","tab3");
  div_setting_area.classList.add("tab" + tab_number);
}

function setting_show () {
  if (game_status !== "standby" && game_status !== "ready" && game_status !== "finish" && game_status !== "pause") return;
  div_setting_wrap.style.display = "grid";

  for (let i = 1; i <= 100; i++) {
    if (document.body.classList.contains("cs" + i)) {
      select_cell_size.value = String(i);
      break;
    }
  }
  input_setting_time_display.checked = !div_time_label.classList.contains("hidden");
  input_setting_ghost_display.checked = !div_field.classList.contains("no_ghost");
  let div_next_arr = Array.from(div_nexts_wrapper.getElementsByClassName("next_wrapper"));
  let next_display_number = div_next_arr.filter(elem => (!elem.classList.contains("hidden"))).length;
  select_next_display_number.value = String(next_display_number);

  input_initial_level.value = initial_level;
  input_level_up_line_number.value = level_up_line_number;
  input_soft_drop_score.value = soft_drop_score;
  input_hard_drop_score.value = hard_drop_score;
  input_single_score_base.value = single_score_base;
  input_single_score_multi.value = single_score_multi;
  input_double_score_base.value = double_score_base;
  input_double_score_multi.value = double_score_multi;
  input_triple_score_base.value = triple_score_base;
  input_triple_score_multi.value = triple_score_multi;
  input_tetris_score_base.value = tetris_score_base;
  input_tetris_score_multi.value = tetris_score_multi;
  input_initial_drop_time.value = initial_drop_time;
  if (time_decrease_num !== 0) {
    input_time_decrease_num.value = time_decrease_num;
    input_opt_decrease_num.checked = true;
  }else{
    input_time_decrease_multi.value = 100 - time_decrease_multi * 100;
    input_opt_decrease_multi.checked = true;
  }
  time_decrease_opt_func();

  input_setting_left_move.value = key_set_to_list(keys_left_move);
  input_setting_right_move.value = key_set_to_list(keys_right_move);
  input_setting_left_rotate.value = key_set_to_list(keys_left_rotate);
  input_setting_right_rotate.value = key_set_to_list(keys_right_rotate);
  input_setting_soft_drop.value = key_set_to_list(keys_soft_drop);
  input_setting_hard_drop.value = key_set_to_list(keys_hard_drop);
  input_setting_hold.value = key_set_to_list(keys_hold);
  input_setting_start_pause_resume.value = key_set_to_list(keys_start_pause_resume);
  
}

function setting_decide () {
  div_setting_wrap.style.display = "none";

  document.body.classList.remove("cs2","cs4","cs6","cs9","cs12","cs16","cs20","cs25","cs30","cs36","cs45","cs60");
  document.body.classList.add("cs" + select_cell_size.value);
  if (input_setting_time_display.checked) {
    div_time_label.classList.remove("hidden");
  }else{
    div_time_label.classList.add("hidden");
  }
  if (input_setting_ghost_display.checked) {
    div_field.classList.remove("no_ghost");
  }else{
    div_field.classList.add("no_ghost");
  }
  let next_display_number = Number(select_next_display_number.value);
  let div_next_arr = Array.from(div_nexts_wrapper.getElementsByClassName("next_wrapper"));
  for (let i = 0; i < 6; i++) {
    if (i < next_display_number) {
      div_next_arr[i].classList.remove("hidden");
    }else{
      div_next_arr[i].classList.add("hidden");
    }
  }
  initial_level = Number(input_initial_level.value);
  level_up_line_number = Number(input_level_up_line_number.value);
  soft_drop_score = Number(input_soft_drop_score.value);
  hard_drop_score = Number(input_hard_drop_score.value);
  single_score_base = Number(input_single_score_base.value);
  single_score_multi = Number(input_single_score_multi.value);
  double_score_base = Number(input_double_score_base.value);
  double_score_multi = Number(input_double_score_multi.value);
  triple_score_base = Number(input_triple_score_base.value);
  triple_score_multi = Number(input_triple_score_multi.value);
  tetris_score_base = Number(input_tetris_score_base.value);
  tetris_score_multi = Number(input_tetris_score_multi.value);
  initial_drop_time = Number(input_initial_drop_time.value);
  if (input_opt_decrease_num.checked) {
    time_decrease_num = Number(input_time_decrease_num.value);
    time_decrease_multi = 1;
  }else{
    time_decrease_num = 0;
    time_decrease_multi = 1 - Number(input_time_decrease_multi.value) / 100;
  }

  keys_left_move = key_list_to_set(input_setting_left_move.value);
  keys_right_move = key_list_to_set(input_setting_right_move.value);
  keys_left_rotate = key_list_to_set(input_setting_left_rotate.value);
  keys_right_rotate = key_list_to_set(input_setting_right_rotate.value);
  keys_soft_drop = key_list_to_set(input_setting_soft_drop.value);
  keys_hard_drop = key_list_to_set(input_setting_hard_drop.value);
  keys_hold = key_list_to_set(input_setting_hold.value);
  keys_start_pause_resume = key_list_to_set(input_setting_start_pause_resume.value);
  
  registering_input_elem = undefined;
  registering_div_label = undefined;
  
  if (game_status === "ready") prepare_game();
  add_message("設定を変更しました。");
}

function setting_cancel () {
  div_setting_wrap.style.display = "none";
  registering_input_elem = undefined;
  registering_div_label = undefined;
  
}

function time_decrease_opt_func () {
  if (input_opt_decrease_num.checked) {
    input_time_decrease_num.disabled = false;
    input_time_decrease_multi.disabled = true;
  }else{
    input_time_decrease_num.disabled = true;
    input_time_decrease_multi.disabled = false;
  }
}

const key_table = [
  {list: "Space", set: " "},
  {list: "左クリック", set: "ボタン0"},
  {list: "右クリック", set: "ボタン2"},
  {list: "中央クリック", set: "ボタン1"},
  {list: "←", set: "ArrowLeft"},
  {list: "→", set: "ArrowRight"},
  {list: "↑", set: "ArrowUp"},
  {list: "↓", set: "ArrowDown"},
  
]

/**
 * 
 * @param {string} key_list コンマ区切りのリスト
 * @returns {Set}           
 */
function key_list_to_set (key_list) {
  let my_arr = key_list.split(",");
  my_arr = my_arr.map(function (elem) {
    let find_result = key_table.find(elem2 => (elem2.list === elem));
    if (find_result === undefined) {
      return elem;
    }else{
      return find_result.set;
    }
  });
  return new Set(my_arr);
}

/**
 * 
 * @param {Set} key_set 
 * @returns {string}    コンマ区切りのリスト
 */
function key_set_to_list (key_set) {
  let my_arr = Array.from(key_set);
  my_arr = my_arr.map(function (elem) {
    let find_result = key_table.find(elem2 => (elem2.set === elem));
    if (find_result === undefined) {
      return elem;
    }else{
      return find_result.list;
    }
  });
  return my_arr.join(",");
}

/**@type {HTMLInputElement|undefined} */
let registering_input_elem = undefined;
/**@type {HTMLDivElement|undefined} */
let registering_div_label = undefined;

/**
 * 
 * @param {Event} event 
 */
function key_register_listener (event) {
  /**@type {HTMLInputElement} */
  let target_input = event.target;
  registering_input_elem = target_input.parentElement.getElementsByClassName("key_list")[0];
  registering_div_label = target_input.parentElement.previousElementSibling;
  registering_div_label.classList.add("registering");
}

/**
 * 
 * @param {Event} event 
 */
function key_delete_listener (event) {
  /**@type {HTMLInputElement} */
  let target_input = event.target;
  /**@type {HTMLInputElement} */
  let key_list_input = target_input.parentElement.getElementsByClassName("key_list")[0];
  key_list_input.value = key_list_input.value.split(",").slice(0, -1).join(",");
}

/**
 * 
 * @param {Event} event 
 */
function key_reset_listener (event) {
  /**@type {HTMLInputElement} */
  let target_input = event.target;
  /**@type {HTMLInputElement} */
  let key_list_input = target_input.parentElement.getElementsByClassName("key_list")[0];
  key_list_input.value = "";
}



function game_over_show () {
  if (game_status === "finish") {
    div_game_over_level.innerText = div_level.innerText;
    div_game_over_score.innerText = div_score.innerText;
    div_game_over_time.innerText = div_time_label.innerText;
    textarea_game_over_log_body.value = span_message.innerText;
    div_game_over_wrap.style.display = "grid";
  }
}
function game_over_hide () {
  div_game_over_wrap.style.display = "none";
}


function format_time (milliseconds) {
  let my_milliseconds = milliseconds % 1000;
  let my_seconds = Math.floor(milliseconds / 1000) % 60;
  let my_minutes = Math.floor(milliseconds / 60000) % 60;
  let my_hours = Math.floor(milliseconds / 3600000) % 60;
  my_milliseconds = "000" + String(my_milliseconds);
  my_milliseconds = my_milliseconds.slice(-3);
  my_seconds = "00" + String(my_seconds);
  my_seconds = my_seconds.slice(-2);
  my_minutes = "00" + String(my_minutes);
  my_minutes = my_minutes.slice(-2);
  my_hours = "00" + String(my_hours);
  my_hours = my_hours.slice(-2);
  return my_hours + ":" + my_minutes + ":" + my_seconds + "." + my_milliseconds;
}

init();
setting_init();
prepare_game();
