const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let star;
let speed = 2; // 向上移动的速度

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建一个更大的世界边界，让星形有足够的移动空间
  this.cameras.main.setBounds(0, 0, 800, 3000);
  
  // 使用 Graphics 绘制一个星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色星形
  graphics.lineStyle(2, 0xffa500, 1); // 橙色描边
  
  // 绘制五角星
  const points = [];
  const starPoints = 5;
  const outerRadius = 30;
  const innerRadius = 15;
  
  for (let i = 0; i < starPoints * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / starPoints - Math.PI / 2;
    points.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    });
  }
  
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('starTexture', 60, 60);
  graphics.destroy();
  
  // 创建星形精灵，初始位置在屏幕底部中央
  star = this.add.sprite(400, 2800, 'starTexture');
  
  // 设置相机跟随星形对象
  // startFollow(target, roundPixels, lerpX, lerpY, offsetX, offsetY)
  // lerpX 和 lerpY 设置为 0.1 可以让相机平滑跟随
  this.cameras.main.startFollow(star, true, 0.1, 0.1);
  
  // 添加说明文字（固定在相机上）
  const text = this.add.text(10, 10, '星形自动向上移动\n相机跟随并保持居中', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机上，不随场景滚动
  
  // 添加位置信息文字
  this.positionText = this.add.text(10, 80, '', {
    fontSize: '16px',
    fill: '#00ff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  this.positionText.setScrollFactor(0);
}

function update(time, delta) {
  // 让星形向上移动
  star.y -= speed;
  
  // 更新位置信息
  this.positionText.setText(
    `星形位置: (${Math.round(star.x)}, ${Math.round(star.y)})\n` +
    `相机位置: (${Math.round(this.cameras.main.scrollX)}, ${Math.round(this.cameras.main.scrollY)})`
  );
  
  // 当星形到达顶部时，重置到底部
  if (star.y < -30) {
    star.y = 2800;
  }
}

new Phaser.Game(config);