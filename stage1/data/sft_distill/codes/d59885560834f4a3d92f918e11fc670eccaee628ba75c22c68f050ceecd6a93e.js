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
    create: create
  }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制白色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  
  // 绘制一个等边三角形（中心对齐）
  // 三角形顶点坐标（相对于中心点）
  const triangleHeight = 40;
  const triangleBase = 40;
  
  graphics.fillTriangle(
    0, -triangleHeight / 2,           // 顶点（上）
    -triangleBase / 2, triangleHeight / 2,  // 左下
    triangleBase / 2, triangleHeight / 2    // 右下
  );
  
  // 生成纹理
  graphics.generateTexture('triangle', triangleBase, triangleHeight);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建物理精灵
  const triangle = this.physics.add.sprite(400, 300, 'triangle');
  
  // 设置初始速度（斜向移动，总速度约为 160）
  // 使用勾股定理：sqrt(113^2 + 113^2) ≈ 160
  triangle.setVelocity(113, 113);
  
  // 设置边界碰撞
  triangle.setCollideWorldBounds(true);
  
  // 设置反弹系数为 1（完全弹性碰撞）
  triangle.setBounce(1, 1);
  
  // 可选：添加文字说明
  this.add.text(10, 10, 'White triangle bouncing at speed 160', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);