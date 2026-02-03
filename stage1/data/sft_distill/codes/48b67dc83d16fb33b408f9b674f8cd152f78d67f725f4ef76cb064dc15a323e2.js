const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 无重力
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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制红色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1); // 红色
  
  // 绘制星形（中心点在 50, 50，半径 50）
  graphics.fillStar(50, 50, 5, 25, 50);
  
  // 生成纹理
  graphics.generateTexture('starTexture', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建物理精灵
  this.star = this.physics.add.sprite(400, 300, 'starTexture');
  
  // 设置初始速度（120 速度，斜向移动）
  // 使用勾股定理：速度分解为 x 和 y 方向，保证总速度为 120
  const speed = 120;
  const angle = Math.PI / 4; // 45度角
  const vx = speed * Math.cos(angle);
  const vy = speed * Math.sin(angle);
  this.star.setVelocity(vx, vy);
  
  // 设置碰撞世界边界
  this.star.setCollideWorldBounds(true);
  
  // 设置反弹系数为 1（完全弹性碰撞）
  this.star.setBounce(1, 1);
}

function update(time, delta) {
  // 不需要额外的更新逻辑，物理系统会自动处理移动和反弹
}

new Phaser.Game(config);