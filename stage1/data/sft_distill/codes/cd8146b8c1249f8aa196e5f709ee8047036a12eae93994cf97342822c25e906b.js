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

let diamond;
let keys;
const SPEED = 80; // 像素/秒

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建一个容器来承载菱形图形
  diamond = this.add.container(400, 300);
  
  // 使用 Graphics 绘制菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制菱形路径（中心点在原点）
  const path = new Phaser.Geom.Polygon([
    0, -30,    // 上顶点
    30, 0,     // 右顶点
    0, 30,     // 下顶点
    -30, 0     // 左顶点
  ]);
  
  graphics.fillPoints(path.points, true);
  
  // 将 graphics 添加到容器中
  diamond.add(graphics);
  
  // 注册 WASD 键
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
}

function update(time, delta) {
  // 将 delta 从毫秒转换为秒
  const deltaSeconds = delta / 1000;
  
  // 计算本帧的移动距离
  const moveDistance = SPEED * deltaSeconds;
  
  // 根据按键状态更新位置
  if (keys.w.isDown) {
    diamond.y -= moveDistance;
  }
  if (keys.s.isDown) {
    diamond.y += moveDistance;
  }
  if (keys.a.isDown) {
    diamond.x -= moveDistance;
  }
  if (keys.d.isDown) {
    diamond.x += moveDistance;
  }
}

new Phaser.Game(config);