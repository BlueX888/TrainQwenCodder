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
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制粉色星形
  const graphics = this.add.graphics();
  
  // 设置粉色填充
  graphics.fillStyle(0xff69b4, 1);
  
  // 绘制星形（五角星）
  const starPoints = [];
  const outerRadius = 50;
  const innerRadius = 20;
  const points = 5;
  
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    starPoints.push(
      outerRadius + radius * Math.cos(angle),
      outerRadius + radius * Math.sin(angle)
    );
  }
  
  graphics.beginPath();
  graphics.moveTo(starPoints[0], starPoints[1]);
  for (let i = 2; i < starPoints.length; i += 2) {
    graphics.lineTo(starPoints[i], starPoints[i + 1]);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('pinkStar', outerRadius * 2, outerRadius * 2);
  graphics.destroy();
  
  // 创建星形精灵并居中显示
  const star = this.add.sprite(400, 300, 'pinkStar');
  
  // 创建闪烁动画
  // 使用 alpha 透明度从 1 渐变到 0.2 再回到 1，实现闪烁效果
  this.tweens.add({
    targets: star,
    alpha: 0.2,           // 目标透明度（较暗）
    duration: 750,        // 单程时长 0.75 秒
    yoyo: true,           // 往返动画（0.75秒变暗 + 0.75秒变亮 = 1.5秒）
    repeat: -1,           // 无限循环
    ease: 'Sine.easeInOut' // 平滑过渡
  });
  
  // 添加提示文本
  this.add.text(400, 500, '粉色星形闪烁动画 (1.5秒/次)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);