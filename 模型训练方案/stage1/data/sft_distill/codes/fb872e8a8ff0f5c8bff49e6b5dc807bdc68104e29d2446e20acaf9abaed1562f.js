class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.zoomComplete = false; // 状态信号：缩放是否完成
    this.animationProgress = 0; // 动画进度 0-100
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建背景
    const background = this.add.graphics();
    background.fillStyle(0x1a1a2e, 1);
    background.fillRect(0, 0, width, height);

    // 创建网格作为缩放参照
    const grid = this.add.graphics();
    grid.lineStyle(2, 0x16213e, 0.8);
    const gridSize = 50;
    
    // 绘制垂直线
    for (let x = 0; x <= width; x += gridSize) {
      grid.moveTo(x, 0);
      grid.lineTo(x, height);
    }
    
    // 绘制水平线
    for (let y = 0; y <= height; y += gridSize) {
      grid.moveTo(0, y);
      grid.lineTo(width, y);
    }
    grid.strokePath();

    // 创建中心圆形作为焦点
    const centerCircle = this.add.graphics();
    centerCircle.fillStyle(0x0f3460, 1);
    centerCircle.fillCircle(width / 2, height / 2, 80);
    centerCircle.lineStyle(4, 0xe94560, 1);
    centerCircle.strokeCircle(width / 2, height / 2, 80);

    // 创建四个角落的方块
    const cornerSize = 60;
    const corners = this.add.graphics();
    corners.fillStyle(0xe94560, 1);
    
    // 左上
    corners.fillRect(50, 50, cornerSize, cornerSize);
    // 右上
    corners.fillRect(width - 50 - cornerSize, 50, cornerSize, cornerSize);
    // 左下
    corners.fillRect(50, height - 50 - cornerSize, cornerSize, cornerSize);
    // 右下
    corners.fillRect(width - 50 - cornerSize, height - 50 - cornerSize, cornerSize, cornerSize);

    // 添加文本提示
    const statusText = this.add.text(width / 2, height / 2, 'Zooming In...', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      align: 'center'
    });
    statusText.setOrigin(0.5);

    // 添加进度文本
    const progressText = this.add.text(width / 2, height / 2 + 50, 'Progress: 0%', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#e94560',
      align: 'center'
    });
    progressText.setOrigin(0.5);

    // 获取主相机
    const camera = this.cameras.main;

    // 设置初始缩放值（从 0.5 倍开始）
    camera.setZoom(0.5);

    // 执行缩放动画：从 0.5 缩放到 1.0，持续 2500 毫秒
    camera.zoomTo(1.0, 2500, 'Sine.easeInOut', true);

    // 使用 tween 更新进度显示
    this.tweens.add({
      targets: this,
      animationProgress: 100,
      duration: 2500,
      ease: 'Sine.easeInOut',
      onUpdate: () => {
        progressText.setText(`Progress: ${Math.floor(this.animationProgress)}%`);
      },
      onComplete: () => {
        this.zoomComplete = true;
        statusText.setText('Zoom Complete!');
        statusText.setColor('#00ff00');
        console.log('Zoom animation completed!');
        console.log('Final zoom level:', camera.zoom);
        console.log('Status: zoomComplete =', this.zoomComplete);
      }
    });

    // 添加一个旋转的星星作为额外的视觉效果
    const star = this.add.graphics();
    star.fillStyle(0xffff00, 1);
    this.drawStar(star, width / 2, 100, 5, 30, 15);
    
    // 旋转星星
    this.tweens.add({
      targets: star,
      angle: 360,
      duration: 3000,
      repeat: -1,
      ease: 'Linear'
    });

    // 调试信息
    console.log('Scene started with zoom:', camera.zoom);
    console.log('Target zoom: 1.0, Duration: 2500ms');
  }

  // 辅助方法：绘制星星
  drawStar(graphics, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    graphics.beginPath();
    graphics.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      graphics.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      graphics.lineTo(x, y);
      rot += step;
    }

    graphics.lineTo(cx, cy - outerRadius);
    graphics.closePath();
    graphics.fillPath();
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
    // 当前实现主要依赖 tween 和 camera 的内置动画
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);