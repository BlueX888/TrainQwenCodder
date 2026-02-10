const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 不需要重力
      debug: false
    }
  },
  scene: { preload, create, update }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 创建红色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1); // 红色
  graphics.fillRect(0, 0, 50, 50); // 50x50 的方块
  graphics.generateTexture('redSquare', 50, 50);
  graphics.destroy(); // 生成纹理后销毁 graphics 对象
  
  // 创建物理精灵，位置在画布中心
  const square = this.physics.add.sprite(400, 300, 'redSquare');
  
  // 设置初始速度（200像素/秒，方向为右下45度）
  square.setVelocity(200, 200);
  
  // 设置反弹系数为1（完全弹性碰撞）
  square.setBounce(1, 1);
  
  // 设置与世界边界碰撞
  square.setCollideWorldBounds(true);
  
  // 可选：保存引用以便在 update 中使用
  this.square = square;
}

function update(time, delta) {
  // 方块会自动由物理引擎处理移动和反弹
  // 如果需要额外逻辑可以在这里添加
}

new Phaser.Game(config);