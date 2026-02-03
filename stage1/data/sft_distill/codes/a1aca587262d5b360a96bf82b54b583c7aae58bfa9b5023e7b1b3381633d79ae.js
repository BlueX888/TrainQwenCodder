const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let square;
let velocity = { x: 120, y: 120 };

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 创建橙色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFF8800, 1); // 橙色
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('orangeSquare', 50, 50);
  graphics.destroy();

  // 创建物理精灵
  square = this.physics.add.sprite(400, 300, 'orangeSquare');
  
  // 设置初始速度
  square.setVelocity(velocity.x, velocity.y);
  
  // 设置精灵在世界边界内
  square.setCollideWorldBounds(true);
  
  // 设置反弹系数
  square.setBounce(1, 1);
  
  // 确保世界边界开启
  this.physics.world.setBoundsCollision(true, true, true, true);
}

function update(time, delta) {
  // Arcade 物理系统的 bounce 和 collideWorldBounds 会自动处理反弹
  // 无需手动检测边界
}

new Phaser.Game(config);