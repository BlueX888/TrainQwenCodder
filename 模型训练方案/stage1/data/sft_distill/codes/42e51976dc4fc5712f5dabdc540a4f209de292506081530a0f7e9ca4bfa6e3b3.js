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
const rotationSpeed = 300; // 每秒旋转 300 度

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制星形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为黄色
  graphics.fillStyle(0xffff00, 1);
  
  // 绘制星形：中心点(0, 0)，5个角，外半径60，内半径25
  graphics.fillStar(0, 0, 5, 25, 60);
  
  // 生成纹理
  graphics.generateTexture('starTexture', 120, 120);
  
  // 销毁 graphics 对象（纹理已生成，不再需要）
  graphics.destroy();
  
  // 在屏幕中心创建星形精灵
  star = this.add.sprite(400, 300, 'starTexture');
  
  // 可选：添加描边效果
  const outlineGraphics = this.add.graphics();
  outlineGraphics.lineStyle(2, 0xffffff, 1);
  outlineGraphics.strokeStar(0, 0, 5, 25, 60);
  outlineGraphics.generateTexture('starOutline', 120, 120);
  outlineGraphics.destroy();
  
  // 添加描边层
  const outline = this.add.sprite(400, 300, 'starOutline');
  outline.setDepth(-1);
  
  // 将描边与星形关联（同步旋转）
  star.outline = outline;
  
  // 添加文字说明
  this.add.text(400, 50, '星形旋转：300度/秒', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

function update(time, delta) {
  // delta 是以毫秒为单位的时间差
  // 将旋转速度转换为每毫秒的旋转角度
  const rotationDelta = rotationSpeed * (delta / 1000);
  
  // 更新星形旋转角度（Phaser 使用度数）
  star.angle += rotationDelta;
  
  // 同步更新描边的旋转
  if (star.outline) {
    star.outline.angle = star.angle;
  }
}

// 启动游戏
new Phaser.Game(config);