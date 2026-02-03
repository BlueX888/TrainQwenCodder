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
    create: create
  }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制紫色星形
  const graphics = this.add.graphics();
  
  // 设置紫色填充
  graphics.fillStyle(0x9933ff, 1);
  
  // 绘制星形（中心点, 5个角, 内半径, 外半径）
  graphics.fillStar(50, 50, 5, 20, 40);
  
  // 生成纹理
  graphics.generateTexture('starTexture', 100, 100);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 创建物理精灵
  const star = this.physics.add.sprite(400, 300, 'starTexture');
  
  // 设置初始速度（160 速度，斜向移动）
  // 使用勾股定理：速度分量 = 160 / √2 ≈ 113
  star.setVelocity(113, 113);
  
  // 设置反弹系数为 1（完全弹性碰撞）
  star.setBounce(1, 1);
  
  // 启用世界边界碰撞
  star.setCollideWorldBounds(true);
  
  // 添加提示文本
  this.add.text(10, 10, '紫色星形以160速度移动并反弹', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);