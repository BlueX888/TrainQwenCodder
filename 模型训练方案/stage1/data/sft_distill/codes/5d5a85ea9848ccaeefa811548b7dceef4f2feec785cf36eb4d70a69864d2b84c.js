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
const MOVE_SPEED = 100; // 每秒移动的像素数

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 设置世界边界，让场景足够大以便观察跟随效果
  this.cameras.main.setBounds(0, 0, 2000, 2000);
  this.physics.world.setBounds(0, 0, 2000, 2000);

  // 使用 Graphics 绘制六边形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.lineStyle(3, 0xffffff, 1);

  // 绘制六边形（中心点为原点）
  const hexRadius = 30;
  const hexPath = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = hexRadius * Math.cos(angle);
    const y = hexRadius * Math.sin(angle);
    hexPath.push(new Phaser.Math.Vector2(x, y));
  }

  graphics.beginPath();
  graphics.moveTo(hexPath[0].x, hexPath[0].y);
  for (let i = 1; i < hexPath.length; i++) {
    graphics.lineTo(hexPath[i].x, hexPath[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();

  // 生成纹理
  graphics.generateTexture('hexagon', hexRadius * 2 + 10, hexRadius * 2 + 10);
  graphics.destroy();

  // 创建六边形精灵，初始位置在场景中心偏右上
  hexagon = this.add.sprite(1000, 500, 'hexagon');

  // 添加一些参考网格线以便观察移动
  const gridGraphics = this.add.graphics();
  gridGraphics.lineStyle(1, 0x444444, 0.5);
  for (let x = 0; x <= 2000; x += 100) {
    gridGraphics.lineTo(x, 0);
    gridGraphics.lineTo(x, 2000);
    gridGraphics.moveTo(x + 100, 0);
  }
  for (let y = 0; y <= 2000; y += 100) {
    gridGraphics.moveTo(0, y);
    gridGraphics.lineTo(2000, y);
  }
  gridGraphics.strokePath();

  // 添加坐标文本提示
  const infoText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  infoText.setScrollFactor(0); // 固定在相机视图上

  // 存储文本对象以便在 update 中更新
  this.infoText = infoText;

  // 相机跟随六边形
  this.cameras.main.startFollow(hexagon, true, 0.1, 0.1);
  
  // 可选：设置跟随偏移，让六边形不完全居中
  // this.cameras.main.setFollowOffset(0, 0);
}

function update(time, delta) {
  // 计算移动距离（基于帧时间）
  const moveDistance = (MOVE_SPEED * delta) / 1000;

  // 向左下移动（左：x减小，下：y增大）
  // 45度角移动
  const moveX = -moveDistance * Math.cos(Math.PI / 4);
  const moveY = moveDistance * Math.sin(Math.PI / 4);

  hexagon.x += moveX;
  hexagon.y += moveY;

  // 更新信息文本
  this.infoText.setText([
    `六边形位置: (${Math.round(hexagon.x)}, ${Math.round(hexagon.y)})`,
    `相机位置: (${Math.round(this.cameras.main.scrollX)}, ${Math.round(this.cameras.main.scrollY)})`,
    '相机正在跟随六边形移动'
  ]);

  // 可选：当六边形移出世界边界时重置位置
  if (hexagon.x < 0 || hexagon.y > 2000) {
    hexagon.x = 1000;
    hexagon.y = 500;
  }
}

new Phaser.Game(config);