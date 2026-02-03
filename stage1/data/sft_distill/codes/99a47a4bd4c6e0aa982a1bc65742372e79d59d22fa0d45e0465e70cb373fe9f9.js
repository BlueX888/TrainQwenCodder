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
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制红色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1); // 红色
  
  // 绘制星形（中心点在 50, 50，半径 50）
  graphics.fillStar(50, 50, 5, 20, 50, 0);
  
  // 生成纹理
  graphics.generateTexture('star', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建物理精灵
  const star = this.physics.add.sprite(400, 300, 'star');
  
  // 设置初始速度（360 速度，斜向移动）
  star.setVelocity(360 * Math.cos(Math.PI / 4), 360 * Math.sin(Math.PI / 4));
  
  // 设置反弹系数为 1（完全弹性碰撞）
  star.setBounce(1, 1);
  
  // 启用世界边界碰撞
  star.setCollideWorldBounds(true);
  
  // 可选：设置星形的显示大小
  star.setDisplaySize(60, 60);
}

new Phaser.Game(config);