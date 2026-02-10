const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制黄色六边形
  const graphics = this.add.graphics();
  
  // 设置黄色填充
  graphics.fillStyle(0xffff00, 1);
  
  // 绘制六边形（中心点为原点）
  const hexRadius = 40;
  const hexPath = [];
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个角60度
    const x = hexRadius * Math.cos(angle);
    const y = hexRadius * Math.sin(angle);
    hexPath.push(x, y);
  }
  
  graphics.fillPoints(hexPath, true);
  
  // 将 Graphics 转换为纹理
  graphics.generateTexture('hexagon', hexRadius * 2, hexRadius * 2);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 创建使用六边形纹理的精灵
  const hexSprite = this.add.sprite(100, 300, 'hexagon');
  
  // 创建补间动画：从左到右移动
  this.tweens.add({
    targets: hexSprite,
    x: 700, // 目标 x 坐标（右侧）
    duration: 2000, // 持续时间 2 秒
    yoyo: true, // 启用往返效果（到达终点后反向播放）
    loop: -1, // 无限循环（-1 表示永久循环）
    ease: 'Linear' // 线性缓动（匀速移动）
  });
}

new Phaser.Game(config);