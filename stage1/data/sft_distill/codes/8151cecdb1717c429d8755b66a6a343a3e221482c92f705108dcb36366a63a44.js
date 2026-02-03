const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制六边形
  const graphics = this.add.graphics();
  
  // 设置黄色填充
  graphics.fillStyle(0xffff00, 1);
  
  // 计算六边形的顶点坐标（中心在原点，半径为 50）
  const hexRadius = 50;
  const hexPoints = [];
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个角度 60 度
    const x = hexRadius * Math.cos(angle);
    const y = hexRadius * Math.sin(angle);
    hexPoints.push({ x, y });
  }
  
  // 绘制六边形
  graphics.fillPoints(hexPoints, true);
  
  // 将 Graphics 转换为纹理
  graphics.generateTexture('hexagon', hexRadius * 2, hexRadius * 2);
  
  // 销毁 Graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 在屏幕中心创建六边形精灵
  const hexSprite = this.add.sprite(400, 300, 'hexagon');
  
  // 创建淡入淡出动画
  // 使用 yoyo 模式：alpha 从 0→1（淡入 0.5秒），然后 1→0（淡出 0.5秒）
  this.tweens.add({
    targets: hexSprite,
    alpha: { from: 0, to: 1 },
    duration: 500,        // 淡入时间 0.5 秒
    yoyo: true,           // 启用往返效果（淡入后自动淡出）
    repeat: -1,           // 无限循环
    ease: 'Sine.easeInOut' // 平滑的缓动效果
  });
}

new Phaser.Game(config);