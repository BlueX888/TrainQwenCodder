const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
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
  
  // 绘制黄色星形
  star.fillStyle(0xffff00, 1);
  star.fillStar(0, 0, 5, 20, 40);
  
  // 设置 WASD 键盘输入
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
}

function update(time, delta) {
  // 将 delta 从毫秒转换为秒
  const deltaInSeconds = delta / 1000;
  
  // 计算本帧应移动的距离
  const moveDistance = SPEED * deltaInSeconds;
  
  // 根据按键状态更新星形位置
  if (keys.w.isDown) {
    star.y -= moveDistance;
  }
  if (keys.s.isDown) {
    star.y += moveDistance;
  }
  if (keys.a.isDown) {
    star.x -= moveDistance;
  }
  if (keys.d.isDown) {
    star.x += moveDistance;
  }
  
  // 边界限制（可选，防止星形移出屏幕）
  star.x = Phaser.Math.Clamp(star.x, 0, 800);
  star.y = Phaser.Math.Clamp(star.y, 0, 600);
}

new Phaser.Game(config);