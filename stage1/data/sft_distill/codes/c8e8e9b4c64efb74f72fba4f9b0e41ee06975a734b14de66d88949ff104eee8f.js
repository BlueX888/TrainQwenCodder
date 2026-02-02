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

let player;
let keyW, keyA, keyS, keyD;
const SPEED = 360; // 像素/秒

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建一个蓝色方块作为玩家
  player = this.add.rectangle(400, 300, 50, 50, 0x00aaff);
  
  // 监听 WASD 按键
  keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  
  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the square', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算本帧的移动距离 = 速度 * 时间（秒）
  const distance = SPEED * (delta / 1000);
  
  // 初始化速度向量
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测按键状态并设置速度方向
  if (keyW.isDown) {
    velocityY = -1; // 向上
  }
  if (keyS.isDown) {
    velocityY = 1; // 向下
  }
  if (keyA.isDown) {
    velocityX = -1; // 向左
  }
  if (keyD.isDown) {
    velocityX = 1; // 向右
  }
  
  // 如果同时按下对角线方向，需要归一化速度向量
  if (velocityX !== 0 && velocityY !== 0) {
    const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    velocityX /= length;
    velocityY /= length;
  }
  
  // 更新玩家位置
  player.x += velocityX * distance;
  player.y += velocityY * distance;
  
  // 限制在屏幕范围内
  player.x = Phaser.Math.Clamp(player.x, 25, 775);
  player.y = Phaser.Math.Clamp(player.y, 25, 575);
}

new Phaser.Game(config);