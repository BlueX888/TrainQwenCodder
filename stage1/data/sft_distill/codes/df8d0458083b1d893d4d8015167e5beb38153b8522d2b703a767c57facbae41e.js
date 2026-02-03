const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },  // 不需要重力
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制蓝色方块
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1);  // 蓝色
  graphics.fillRect(0, 0, 50, 50);  // 50x50 的方块
  
  // 生成纹理
  graphics.generateTexture('blueSquare', 50, 50);
  graphics.destroy();  // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建物理精灵，位置在画布中心
  const square = this.physics.add.sprite(400, 300, 'blueSquare');
  
  // 设置初始速度（斜向移动，速度大小约为200）
  // 使用勾股定理：sqrt(141^2 + 141^2) ≈ 200
  square.setVelocity(141, 141);
  
  // 设置与世界边界碰撞
  square.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  square.setBounce(1, 1);
}

// 启动游戏
new Phaser.Game(config);