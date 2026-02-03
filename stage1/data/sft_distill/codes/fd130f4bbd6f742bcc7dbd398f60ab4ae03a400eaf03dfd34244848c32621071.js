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
let cursors;
const SPEED = 80;
const PLAYER_RADIUS = 20;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制青色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillCircle(PLAYER_RADIUS, PLAYER_RADIUS, PLAYER_RADIUS);
  
  // 生成纹理
  graphics.generateTexture('playerTexture', PLAYER_RADIUS * 2, PLAYER_RADIUS * 2);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建玩家精灵，初始位置在画布中心
  player = this.add.sprite(400, 300, 'playerTexture');
  
  // 获取方向键输入
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 计算每帧移动距离（速度 * 时间）
  const moveDistance = SPEED * (delta / 1000);
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测方向键并设置速度
  if (cursors.left.isDown) {
    velocityX = -SPEED;
  } else if (cursors.right.isDown) {
    velocityX = SPEED;
  }
  
  if (cursors.up.isDown) {
    velocityY = -SPEED;
  } else if (cursors.down.isDown) {
    velocityY = SPEED;
  }
  
  // 更新位置
  player.x += velocityX * (delta / 1000);
  player.y += velocityY * (delta / 1000);
  
  // 限制在画布边界内
  const minX = PLAYER_RADIUS;
  const maxX = config.width - PLAYER_RADIUS;
  const minY = PLAYER_RADIUS;
  const maxY = config.height - PLAYER_RADIUS;
  
  player.x = Phaser.Math.Clamp(player.x, minX, maxX);
  player.y = Phaser.Math.Clamp(player.y, minY, maxY);
}

new Phaser.Game(config);