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
  // 使用 Graphics 绘制黄色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  
  // 绘制一个等边三角形（中心在32,32，边长约56）
  graphics.fillTriangle(
    32, 8,      // 顶点（上）
    8, 56,      // 左下顶点
    56, 56      // 右下顶点
  );
  
  // 生成纹理
  graphics.generateTexture('triangle', 64, 64);
  graphics.destroy(); // 销毁graphics对象，只保留纹理
  
  // 创建物理精灵
  const triangle = this.physics.add.sprite(400, 300, 'triangle');
  
  // 设置速度（240像素/秒，分解到x和y方向）
  // 使用45度角，速度分量约为 240/√2 ≈ 170
  triangle.setVelocity(170, 170);
  
  // 设置边界碰撞
  triangle.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完美弹性碰撞）
  triangle.setBounce(1, 1);
  
  // 可选：设置阻尼为0，确保速度不会衰减
  triangle.body.setDamping(false);
}

new Phaser.Game(config);