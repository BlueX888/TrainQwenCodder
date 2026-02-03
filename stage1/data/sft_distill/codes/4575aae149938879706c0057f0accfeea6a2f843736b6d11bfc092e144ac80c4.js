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

let hexagon;
const MOVE_SPEED = 100; // 每秒向下移动的像素

function preload() {
  // 使用 Graphics 生成六边形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 绘制六边形
  const hexRadius = 40;
  const hexPoints = [];
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = hexRadius + hexRadius * Math.cos(angle);
    const y = hexRadius + hexRadius * Math.sin(angle);
    hexPoints.push(x, y);
  }
  
  // 填充六边形
  graphics.fillStyle(0x00ff00, 1);
  graphics.beginPath();
  graphics.moveTo(hexPoints[0], hexPoints[1]);
  for (let i = 2; i < hexPoints.length; i += 2) {
    graphics.lineTo(hexPoints[i], hexPoints[i + 1]);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 绘制边框
  graphics.lineStyle(3, 0xffffff, 1);
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', hexRadius * 2, hexRadius * 2);
  graphics.destroy();
}

function create() {
  // 设置世界边界，让相机有足够的空间跟随
  this.cameras.main.setBounds(0, 0, 800, 3000);
  this.physics.world.setBounds(0, 0, 800, 3000);
  
  // 创建六边形 Sprite，初始位置在场景上方中央
  hexagon = this.add.sprite(400, 100, 'hexagon');
  
  // 让相机跟随六边形
  // startFollow(target, roundPixels, lerpX, lerpY, offsetX, offsetY)
  // roundPixels: 是否四舍五入像素以避免抖动
  // lerpX/lerpY: 平滑跟随系数 (0-1)，1表示立即跟随，较小值会有平滑效果
  this.cameras.main.startFollow(hexagon, true, 0.1, 0.1);
  
  // 添加一些参考网格线以便观察相机移动
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制水平参考线
  for (let y = 0; y < 3000; y += 100) {
    graphics.moveTo(0, y);
    graphics.lineTo(800, y);
  }
  
  // 绘制垂直参考线
  for (let x = 0; x < 800; x += 100) {
    graphics.moveTo(x, 0);
    graphics.lineTo(x, 3000);
  }
  
  graphics.strokePath();
  
  // 添加文本提示（固定在相机上）
  const text = this.add.text(10, 10, '相机跟随六边形\n六边形自动向下移动', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机视图上，不随世界移动
}

function update(time, delta) {
  // 让六边形持续向下移动
  // delta 是以毫秒为单位的时间差，除以1000转换为秒
  hexagon.y += MOVE_SPEED * (delta / 1000);
  
  // 如果六边形移动到世界底部，重置到顶部
  if (hexagon.y > 2900) {
    hexagon.y = 100;
  }
  
  // 更新文本显示当前位置信息
  const text = this.children.list.find(child => child.type === 'Text');
  if (text) {
    text.setText(
      `相机跟随六边形\n` +
      `六边形自动向下移动\n` +
      `位置: (${Math.round(hexagon.x)}, ${Math.round(hexagon.y)})\n` +
      `相机Y: ${Math.round(this.cameras.main.scrollY)}`
    );
  }
}

new Phaser.Game(config);