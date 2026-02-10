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
  // 无需预加载资源
}

function create() {
  // 计数器，记录已生成的矩形数量
  let rectangleCount = 0;
  const maxRectangles = 5;

  // 添加提示文本
  const infoText = this.add.text(10, 10, '等待生成绿色矩形...', {
    fontSize: '16px',
    color: '#ffffff'
  });

  // 创建定时器事件，每2.5秒执行一次
  this.time.addEvent({
    delay: 2500,                    // 延迟2500毫秒（2.5秒）
    callback: () => {
      // 生成随机位置
      const x = Phaser.Math.Between(50, 750);  // 留出边距
      const y = Phaser.Math.Between(50, 550);
      const width = 60;
      const height = 40;

      // 使用 Graphics 绘制绿色矩形
      const graphics = this.add.graphics();
      graphics.fillStyle(0x00ff00, 1);  // 绿色，完全不透明
      graphics.fillRect(x - width / 2, y - height / 2, width, height);

      // 更新计数器
      rectangleCount++;
      infoText.setText(`已生成矩形: ${rectangleCount}/${maxRectangles}`);

      // 添加位置标记（可选，用于调试）
      this.add.text(x, y, rectangleCount.toString(), {
        fontSize: '14px',
        color: '#000000'
      }).setOrigin(0.5);

      console.log(`生成第 ${rectangleCount} 个矩形，位置: (${x}, ${y})`);
    },
    callbackScope: this,
    repeat: 4                       // 重复4次，加上首次执行共5次
  });

  // 添加完成提示
  this.time.addEvent({
    delay: 2500 * 5,                // 12.5秒后（5次生成完成）
    callback: () => {
      infoText.setText('所有矩形生成完成！');
    },
    callbackScope: this
  });
}

// 启动游戏
new Phaser.Game(config);