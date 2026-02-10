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
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制紫色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9932CC, 1); // 紫色
  graphics.fillCircle(25, 25, 25); // 在中心绘制半径25的圆
  
  // 生成纹理
  graphics.generateTexture('purpleCircle', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建物理精灵
  const circle = this.physics.add.sprite(400, 300, 'purpleCircle');
  
  // 设置边界碰撞
  circle.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  circle.setBounce(1, 1);
  
  // 设置初始速度（300速度，随机方向）
  const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
  const velocityX = Math.cos(angle) * 300;
  const velocityY = Math.sin(angle) * 300;
  circle.setVelocity(velocityX, velocityY);
  
  // 可选：添加拖尾效果使运动更明显
  circle.setDamping(false); // 禁用阻尼，保持恒定速度
}

new Phaser.Game(config);