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
  scene: { preload, create, update }
};

function preload() {
  // 创建紫色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9966ff, 1); // 紫色
  graphics.fillCircle(20, 20, 20); // 半径20的圆形
  graphics.generateTexture('purpleCircle', 40, 40);
  graphics.destroy();
}

function create() {
  // 创建物理精灵
  const circle = this.physics.add.sprite(400, 300, 'purpleCircle');
  
  // 设置初始速度（随机方向，速度为300）
  const angle = Phaser.Math.Between(0, 360);
  const velocityX = Math.cos(angle * Math.PI / 180) * 300;
  const velocityY = Math.sin(angle * Math.PI / 180) * 300;
  circle.setVelocity(velocityX, velocityY);
  
  // 设置边界碰撞
  circle.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  circle.setBounce(1, 1);
}

function update(time, delta) {
  // 游戏逻辑更新（本例中无需额外更新逻辑）
}

new Phaser.Game(config);