class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.zoomComplete = false; // 状态信号：缩放是否完成
    this.zoomProgress = 0; // 状态信号：缩放进度 0-100
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建背景网格
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0x00ff00, 0.5);
    
    // 绘制网格
    for (let i = 0; i <= width; i += 50) {
      graphics.moveTo(i, 0);
      graphics.lineTo(i, height);
    }
    for (let j = 0; j <= height; j += 50) {
      graphics.moveTo(0, j);
      graphics.lineTo(width, j);
    }
    graphics.strokePath();

    // 添加中心圆形
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff0000, 1);
    centerGraphics.fillCircle(width / 2, height / 2, 80);

    // 添加四个角的矩形
    const cornerGraphics = this.add.graphics();
    cornerGraphics.fillStyle(0x0000ff, 1);
    cornerGraphics.fillRect(50, 50, 60, 60);
    cornerGraphics.fillRect(width - 110, 50, 60, 60);
    cornerGraphics.fillRect(50, height - 110, 60, 60);
    cornerGraphics.fillRect(width - 110, height - 110, 60, 60);

    // 添加文本提示
    const text = this.add.text(width / 2, height / 2, 'Scene Zoom Effect', {
      fontSize: '32px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    text.setOrigin(0.5);

    // 添加状态文本
    this.statusText = this.add.text(width / 2, height - 50, 'Zooming...', {
      fontSize: '24px',
      color: '#ffff00'
    });
    this.statusText.setOrigin(0.5);

    // 设置相机初始缩放
    this.cameras.main.setZoom(0.1);

    // 使用 zoomTo 方法实现缩放效果
    this.cameras.main.zoomTo(1.0, 1000, 'Power2', true, (camera, progress) => {
      // 更新缩放进度
      this.zoomProgress = Math.floor(progress * 100);
      this.statusText.setText(`Zooming... ${this.zoomProgress}%`);
      
      // 缩放完成回调
      if (progress === 1) {
        this.zoomComplete = true;
        this.statusText.setText('Zoom Complete!');
        this.statusText.setColor('#00ff00');
        
        // 输出状态到控制台
        console.log('Zoom animation completed');
        console.log('Final zoom level:', camera.zoom);
        console.log('Status:', {
          zoomComplete: this.zoomComplete,
          zoomProgress: this.zoomProgress
        });
      }
    });

    // 添加键盘交互：按空格键重新播放缩放动画
    this.input.keyboard.on('keydown-SPACE', () => {
      this.zoomComplete = false;
      this.zoomProgress = 0;
      this.statusText.setText('Zooming...').setColor('#ffff00');
      this.cameras.main.setZoom(0.1);
      this.cameras.main.zoomTo(1.0, 1000, 'Power2', true, (camera, progress) => {
        this.zoomProgress = Math.floor(progress * 100);
        this.statusText.setText(`Zooming... ${this.zoomProgress}%`);
        if (progress === 1) {
          this.zoomComplete = true;
          this.statusText.setText('Zoom Complete! (Press SPACE to replay)');
          this.statusText.setColor('#00ff00');
        }
      });
    });

    // 添加提示信息
    const hintText = this.add.text(width / 2, 30, 'Press SPACE to replay zoom', {
      fontSize: '18px',
      color: '#cccccc'
    });
    hintText.setOrigin(0.5);
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 暴露状态用于验证
window.getGameStatus = function() {
  const scene = game.scene.scenes[0];
  return {
    zoomComplete: scene.zoomComplete,
    zoomProgress: scene.zoomProgress,
    currentZoom: scene.cameras.main.zoom
  };
};