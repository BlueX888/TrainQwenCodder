const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let star;
let keys;
const SPEED = 240; // 像素/秒

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建星形 Graphics 对象
  star = this.add.graphics();
  star.x = 400;
  star.y = 300;
  
  // 绘制星形
  drawStar(star);
  
  // 添加 WASD 键盘控制
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
}

function update(time, delta) {
  // 计算本帧移动距离（速度 * 时间）
  const distance = SPEED * (delta / 1000);
  
  // 根据按键状态更新星形位置
  if (keys.w.isDown) {
    star.y -= distance;
  }
  if (keys.s.isDown) {
    star.y += distance;
  }
  if (keys.a.isDown) {
    star.x -= distance;
  }
  if (keys.d.isDown) {
    star.x += distance;
  }
  
  // 边界限制（可选）
  star.x = Phaser.Math.Clamp(star.x, 0, 800);
  star.y = Phaser.Math.Clamp(star.y, 0, 600);
}

// 辅助函数：绘制星形
function drawStar(graphics) {
  graphics.fillStyle(0xffff00, 1);
  graphics.fillStar(0, 0, 5, 20, 40);
  graphics.lineStyle(2, 0xffa500, 1);
  graphics.strokeStar(0, 0, 5, 20, 40);
}

new Phaser.Game(config);