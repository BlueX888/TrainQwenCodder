const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

// 记录生成的矩形数量
let rectangleCount = 0;
const MAX_RECTANGLES = 12;

function preload() {
  // 无需预加载资源
}

function create() {
  // 添加标题文字
  this.add.text(10, 10, '每1.5秒生成绿色矩形（最多12个）', {
    fontSize: '18px',
    color: '#ffffff'
  });

  // 显示计数器
  const counterText = this.add.text(10, 40, `已生成: 0 / ${MAX_RECTANGLES}`, {
    fontSize: '16px',
    color: '#ffffff'
  });

  // 创建定时器事件，每1.5秒触发一次，重复11次（加上第一次共12次）
  this.time.addEvent({
    delay: 1500,                    // 1.5秒 = 1500毫秒
    callback: () => {
      // 生成随机位置
      const x = Phaser.Math.Between(50, 750);  // 留出边距，避免矩形超出边界
      const y = Phaser.Math.Between(80, 550);  // 留出顶部标题空间
      
      // 使用 Graphics 绘制绿色矩形
      const graphics = this.add.graphics();
      graphics.fillStyle(0x00ff00, 1);  // 绿色，不透明
      graphics.fillRect(x - 25, y - 25, 50, 50);  // 以中心点为基准绘制50x50矩形
      
      // 添加白色边框使矩形更明显
      graphics.lineStyle(2, 0xffffff, 1);
      graphics.strokeRect(x - 25, y - 25, 50, 50);
      
      // 更新计数器
      rectangleCount++;
      counterText.setText(`已生成: ${rectangleCount} / ${MAX_RECTANGLES}`);
      
      // 在矩形中心显示编号
      this.add.text(x, y, rectangleCount.toString(), {
        fontSize: '20px',
        color: '#000000',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
    },
    callbackScope: this,
    repeat: 11                      // 重复11次，加上初始触发共12次
  });
}

new Phaser.Game(config);