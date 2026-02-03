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

let diamondCount = 0;
const MAX_DIAMONDS = 10;
const DIAMOND_SIZE = 30;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 初始化计数器
  diamondCount = 0;

  // 创建定时器事件，每4秒触发一次
  this.time.addEvent({
    delay: 4000, // 4秒
    callback: spawnDiamond,
    callbackScope: this,
    loop: true
  });

  // 添加文本显示当前菱形数量
  this.diamondCountText = this.add.text(10, 10, 'Diamonds: 0/10', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function spawnDiamond() {
  // 检查是否已达到最大数量
  if (diamondCount >= MAX_DIAMONDS) {
    return;
  }

  // 生成随机位置（确保菱形完全在画布内）
  const x = Phaser.Math.Between(DIAMOND_SIZE, this.game.config.width - DIAMOND_SIZE);
  const y = Phaser.Math.Between(DIAMOND_SIZE, this.game.config.height - DIAMOND_SIZE);

  // 创建 Graphics 对象绘制白色菱形
  const graphics = this.add.graphics();
  graphics.lineStyle(2, 0xffffff, 1);
  graphics.fillStyle(0xffffff, 1);

  // 定义菱形的四个顶点（相对于中心点）
  const points = [
    { x: x, y: y - DIAMOND_SIZE },      // 上顶点
    { x: x + DIAMOND_SIZE, y: y },      // 右顶点
    { x: x, y: y + DIAMOND_SIZE },      // 下顶点
    { x: x - DIAMOND_SIZE, y: y }       // 左顶点
  ];

  // 绘制菱形
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();

  // 增加计数
  diamondCount++;

  // 更新文本显示
  this.diamondCountText.setText(`Diamonds: ${diamondCount}/${MAX_DIAMONDS}`);

  // 如果达到最大数量，显示完成信息
  if (diamondCount >= MAX_DIAMONDS) {
    const completeText = this.add.text(
      this.game.config.width / 2,
      this.game.config.height / 2,
      'All Diamonds Spawned!',
      {
        fontSize: '32px',
        color: '#00ff00',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
      }
    );
    completeText.setOrigin(0.5);
  }
}

new Phaser.Game(config);