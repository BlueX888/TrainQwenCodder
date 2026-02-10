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

function preload() {
  // 使用 Graphics 创建灰色椭圆纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillEllipse(40, 30, 80, 60); // 椭圆中心点和宽高
  graphics.generateTexture('ellipse', 80, 60);
  graphics.destroy();
}

function create() {
  // 创建物理精灵
  this.ellipse = this.physics.add.sprite(400, 300, 'ellipse');
  
  // 设置世界边界碰撞
  this.ellipse.setCollideWorldBounds(true);
  
  // 设置反弹系数为1，实现完全弹性碰撞
  this.ellipse.setBounce(1, 1);
  
  // 设置初始速度（斜向移动，速度大小约为360）
  // 使用勾股定理：sqrt(254^2 + 254^2) ≈ 359.3
  this.ellipse.setVelocity(254, 254);
  
  // 可选：添加提示文本
  this.add.text(10, 10, 'Gray ellipse bouncing at speed ~360', {
    fontSize: '16px',
    fill: '#ffffff'
  });
}

function update(time, delta) {
  // 物理系统自动处理移动和碰撞，无需额外更新逻辑
}

new Phaser.Game(config);