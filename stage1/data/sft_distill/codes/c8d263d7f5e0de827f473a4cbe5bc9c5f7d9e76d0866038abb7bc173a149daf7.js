const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
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
  // 无需预加载外部资源
}

function create() {
  // 使用Graphics绘制紫色方块并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9966ff, 1); // 紫色
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('purpleSquare', 50, 50);
  graphics.destroy();

  // 创建物理精灵
  square = this.physics.add.sprite(400, 300, 'purpleSquare');
  
  // 设置初始速度
  square.setVelocity(velocity.x, velocity.y);
  
  // 设置与世界边界碰撞
  square.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  square.setBounce(1, 1);
}

function update(time, delta) {
  // Phaser的物理系统会自动处理边界碰撞和反弹
  // 当setBounce设置为1且setCollideWorldBounds为true时
  // 方块会在碰到边界时自动反弹
  
  // 可选：手动检测边界并反转速度（如果不使用物理引擎的bounce）
  // 但由于已使用setBounce，这里不需要额外代码
}

new Phaser.Game(config);