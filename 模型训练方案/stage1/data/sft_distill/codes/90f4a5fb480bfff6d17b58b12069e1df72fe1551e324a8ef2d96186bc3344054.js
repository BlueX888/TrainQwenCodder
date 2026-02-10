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
  // 使用 Graphics 绘制红色六边形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为红色
  graphics.fillStyle(0xff0000, 1);
  
  // 绘制六边形
  const hexagonSize = 60;
  const centerX = hexagonSize;
  const centerY = hexagonSize;
  
  // 计算六边形的六个顶点
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个角度60度
    const x = centerX + hexagonSize * Math.cos(angle);
    const y = centerY + hexagonSize * Math.sin(angle);
    points.push(new Phaser.Geom.Point(x, y));
  }
  
  // 绘制多边形
  const polygon = new Phaser.Geom.Polygon(points);
  graphics.fillPoints(polygon.points, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', hexagonSize * 2, hexagonSize * 2);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 创建使用六边形纹理的 Sprite，放置在屏幕中央
  const hexagonSprite = this.add.sprite(400, 300, 'hexagon');
  
  // 创建旋转动画
  this.tweens.add({
    targets: hexagonSprite,        // 动画目标对象
    rotation: Math.PI * 2,         // 旋转角度：2π 弧度（360度）
    duration: 4000,                // 动画持续时间：4秒
    ease: 'Linear',                // 线性缓动，保持匀速旋转
    repeat: -1,                    // 无限循环（-1 表示永久重复）
    yoyo: false                    // 不反向播放
  });
  
  // 添加说明文字
  this.add.text(400, 500, '红色六边形 4 秒旋转一周（循环）', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);