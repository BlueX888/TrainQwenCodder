const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 创建青色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillRect(0, 0, 40, 40);
  graphics.generateTexture('playerBlock', 40, 40);
  graphics.destroy();
}

function create() {
  // 创建玩家方块精灵，初始位置在画布中心
  this.player = this.add.sprite(400, 300, 'playerBlock');
  
  // 创建键盘光标键
  this.cursors = this.input.keyboard.createCursorKeys();
  
  // 移动速度
  this.moveSpeed = 360;
  
  // 方块大小（用于边界检测）
  this.blockSize = 40;
}

function update(time, delta) {
  // 将 delta 转换为秒
  const deltaInSeconds = delta / 1000;
  
  // 计算移动距离
  const moveDistance = this.moveSpeed * deltaInSeconds;
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测方向键输入
  if (this.cursors.left.isDown) {
    velocityX = -moveDistance;
  } else if (this.cursors.right.isDown) {
    velocityX = moveDistance;
  }
  
  if (this.cursors.up.isDown) {
    velocityY = -moveDistance;
  } else if (this.cursors.down.isDown) {
    velocityY = moveDistance;
  }
  
  // 更新玩家位置
  this.player.x += velocityX;
  this.player.y += velocityY;
  
  // 限制在画布边界内（考虑方块大小的一半）
  const halfBlock = this.blockSize / 2;
  this.player.x = Phaser.Math.Clamp(
    this.player.x,
    halfBlock,
    config.width - halfBlock
  );
  this.player.y = Phaser.Math.Clamp(
    this.player.y,
    halfBlock,
    config.height - halfBlock
  );
}

new Phaser.Game(config);