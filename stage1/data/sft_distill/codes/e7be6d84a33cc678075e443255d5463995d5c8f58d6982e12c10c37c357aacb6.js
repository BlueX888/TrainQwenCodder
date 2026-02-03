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
  // 使用 Graphics 绘制粉色六边形
  const graphics = this.add.graphics();
  
  // 设置粉色填充
  graphics.fillStyle(0xff69b4, 1); // 粉色 (HotPink)
  
  // 绘制六边形
  const hexagonRadius = 40;
  const hexagonPath = [];
  
  // 计算六边形的6个顶点
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个角60度
    const x = hexagonRadius + hexagonRadius * Math.cos(angle);
    const y = hexagonRadius + hexagonRadius * Math.sin(angle);
    hexagonPath.push(x, y);
  }
  
  // 绘制多边形
  graphics.fillPoints(hexagonPath, true);
  
  // 生成纹理
  const textureSize = hexagonRadius * 2 + 10; // 留一些边距
  graphics.generateTexture('hexagon', textureSize, textureSize);
  
  // 清除 graphics 对象（已经生成纹理，不再需要）
  graphics.destroy();
  
  // 创建六边形图像对象
  const hexagon = this.add.image(100, 300, 'hexagon');
  
  // 创建补间动画
  this.tweens.add({
    targets: hexagon,           // 动画目标
    x: 700,                     // 目标 x 坐标（从左到右）
    duration: 4000,             // 持续时间 4 秒
    ease: 'Linear',             // 线性缓动
    yoyo: true,                 // 往返效果（到达终点后返回起点）
    loop: -1                    // 无限循环（-1 表示永久循环）
  });
  
  // 添加提示文本
  this.add.text(400, 50, '粉色六边形左右往返循环', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '动画持续4秒，自动往返循环', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

// 启动游戏
new Phaser.Game(config);