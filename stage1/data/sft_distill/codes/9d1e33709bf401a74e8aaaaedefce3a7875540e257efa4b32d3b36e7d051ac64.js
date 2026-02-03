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

// 菱形计数器
let diamondCount = 0;
const MAX_DIAMONDS = 12;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 重置计数器
  diamondCount = 0;

  // 创建定时器事件，每4秒触发一次
  this.time.addEvent({
    delay: 4000, // 4秒 = 4000毫秒
    callback: spawnDiamond,
    callbackScope: this,
    loop: true // 循环执行
  });

  // 立即生成第一个菱形
  spawnDiamond.call(this);

  // 添加提示文本
  this.add.text(10, 10, '红色菱形每4秒生成一个，最多12个', {
    fontSize: '16px',
    color: '#ffffff'
  });

  // 显示计数
  this.countText = this.add.text(10, 40, `当前数量: ${diamondCount}/${MAX_DIAMONDS}`, {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function spawnDiamond() {
  // 检查是否已达到最大数量
  if (diamondCount >= MAX_DIAMONDS) {
    return;
  }

  // 生成随机位置
  // 留出边距，确保菱形完全显示在画布内
  const margin = 40;
  const x = Phaser.Math.Between(margin, config.width - margin);
  const y = Phaser.Math.Between(margin + 60, config.height - margin);

  // 创建菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1); // 红色

  // 菱形尺寸
  const size = 30;

  // 定义菱形的四个顶点（相对于中心点）
  const points = [
    { x: 0, y: -size },      // 上顶点
    { x: size, y: 0 },       // 右顶点
    { x: 0, y: size },       // 下顶点
    { x: -size, y: 0 }       // 左顶点
  ];

  // 绘制菱形
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();

  // 设置菱形位置
  graphics.setPosition(x, y);

  // 添加轻微的旋转动画效果（可选）
  this.tweens.add({
    targets: graphics,
    angle: 360,
    duration: 3000,
    repeat: -1,
    ease: 'Linear'
  });

  // 增加计数
  diamondCount++;

  // 更新计数显示
  if (this.countText) {
    this.countText.setText(`当前数量: ${diamondCount}/${MAX_DIAMONDS}`);
  }

  // 如果达到最大数量，显示完成提示
  if (diamondCount >= MAX_DIAMONDS) {
    this.add.text(config.width / 2, 30, '已生成全部菱形！', {
      fontSize: '20px',
      color: '#ffff00'
    }).setOrigin(0.5);
  }
}

// 启动游戏
new Phaser.Game(config);