const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建星形纹理
  createStarTexture.call(this);
  
  // 绘制5个随机位置的粉色星形
  for (let i = 0; i < 5; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    
    // 使用生成的星形纹理创建图像
    const star = this.add.image(x, y, 'star');
  }
}

/**
 * 创建星形纹理
 */
function createStarTexture() {
  const graphics = this.add.graphics();
  
  // 设置粉色填充
  graphics.fillStyle(0xffc0cb, 1);
  
  // 星形参数
  const size = 64;
  const centerX = size / 2;
  const centerY = size / 2;
  const outerRadius = size / 2;
  const innerRadius = size / 4;
  const points = 5;
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 绘制星形的顶点
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  
  // 闭合路径并填充
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('star', size, size);
  
  // 销毁 graphics 对象（纹理已生成，不再需要）
  graphics.destroy();
}

new Phaser.Game(config);