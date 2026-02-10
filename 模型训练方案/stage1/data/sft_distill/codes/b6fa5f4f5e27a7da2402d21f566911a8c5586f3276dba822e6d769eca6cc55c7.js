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

// 玩家对象
let player;
// 按键对象
let keyW, keyA, keyS, keyD;
// 移动速度（像素/秒）
const SPEED = 300;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建玩家矩形（使用 Graphics）
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色
  graphics.fillRect(0, 0, 50, 50); // 50x50 的矩形
  
  // 将 graphics 转换为纹理以便后续使用
  graphics.generateTexture('playerRect', 50, 50);
  graphics.destroy(); // 销毁临时 graphics 对象
  
  // 创建玩家精灵并设置初始位置
  player = this.add.sprite(400, 300, 'playerRect');
  
  // 注册 WASD 按键
  keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
}

function update(time, delta) {
  // 将 delta 从毫秒转换为秒
  const deltaSeconds = delta / 1000;
  
  // 计算本帧应该移动的距离
  const moveDistance = SPEED * deltaSeconds;
  
  // 检测按键并移动玩家
  if (keyW.isDown) {
    player.y -= moveDistance; // 向上移动
  }
  if (keyS.isDown) {
    player.y += moveDistance; // 向下移动
  }
  if (keyA.isDown) {
    player.x -= moveDistance; // 向左移动
  }
  if (keyD.isDown) {
    player.x += moveDistance; // 向右移动
  }
  
  // 边界限制（可选，防止矩形移出屏幕）
  player.x = Phaser.Math.Clamp(player.x, 25, 775);
  player.y = Phaser.Math.Clamp(player.y, 25, 575);
}

// 启动游戏
new Phaser.Game(config);