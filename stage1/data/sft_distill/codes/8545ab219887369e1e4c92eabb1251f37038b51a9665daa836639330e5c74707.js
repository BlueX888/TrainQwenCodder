const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let player;
let keys;
const SPEED = 200; // 像素/秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建一个矩形玩家对象（使用 Rectangle GameObject）
  player = this.add.rectangle(400, 300, 50, 50, 0x00ff00);
  
  // 绑定 WASD 键
  keys = {
    W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  };
  
  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the rectangle', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 将 delta 从毫秒转换为秒
  const deltaSeconds = delta / 1000;
  
  // 计算本帧的移动距离
  const moveDistance = SPEED * deltaSeconds;
  
  // 根据按键状态更新位置
  if (keys.W.isDown) {
    player.y -= moveDistance;
  }
  if (keys.S.isDown) {
    player.y += moveDistance;
  }
  if (keys.A.isDown) {
    player.x -= moveDistance;
  }
  if (keys.D.isDown) {
    player.x += moveDistance;
  }
  
  // 边界限制（可选，防止矩形移出画布）
  player.x = Phaser.Math.Clamp(player.x, 25, 775);
  player.y = Phaser.Math.Clamp(player.y, 25, 575);
}

new Phaser.Game(config);