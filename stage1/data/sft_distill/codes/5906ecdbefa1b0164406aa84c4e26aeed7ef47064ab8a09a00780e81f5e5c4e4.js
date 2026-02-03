class ZoomScene extends Phaser.Scene {
  constructor() {
    super('ZoomScene');
    this.zoomComplete = false; // 状态信号：缩放是否完成
    this.currentZoom = 0.1; // 状态信号：当前缩放值
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 绘制背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, width, height);

    // 绘制中心标题文本
    const titleText = this.add.text(width / 2, height / 2 - 100, 'ZOOM EFFECT', {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#00ff88',
      fontStyle: 'bold'
    });
    titleText.setOrigin(0.5);

    // 绘制装饰圆圈
    const graphics = this.add.graphics();
    graphics.lineStyle(4, 0x00ff88, 1);
    graphics.strokeCircle(width / 2, height / 2, 150);
    graphics.strokeCircle(width / 2, height / 2, 200);

    // 绘制四角装饰方块
    const cornerSize = 40;
    const cornerGraphics = this.add.graphics();
    cornerGraphics.fillStyle(0xff6b6b, 1);
    cornerGraphics.fillRect(50, 50, cornerSize, cornerSize);
    cornerGraphics.fillRect(width - 50 - cornerSize, 50, cornerSize, cornerSize);
    cornerGraphics.fillRect(50, height - 50 - cornerSize, cornerSize, cornerSize);
    cornerGraphics.fillRect(width - 50 - cornerSize, height - 50 - cornerSize, cornerSize, cornerSize);

    // 状态提示文本
    this.statusText = this.add.text(width / 2, height / 2 + 100, 'Zooming In...', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    this.statusText.setOrigin(0.5);

    // 缩放值显示
    this.zoomValueText = this.add.text(width / 2, height - 50, 'Zoom: 0.10', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffff00'
    });
    this.zoomValueText.setOrigin(0.5);

    // 设置相机初始缩放
    this.cameras.main.setZoom(0.1);

    // 创建缩放 Tween 动画
    this.tweens.add({
      targets: this.cameras.main,
      zoom: 1.0,
      duration: 2500,
      ease: 'Cubic.easeOut', // 使用缓动函数使效果更平滑
      onUpdate: (tween) => {
        // 更新当前缩放值
        this.currentZoom = this.cameras.main.zoom;
        this.zoomValueText.setText(`Zoom: ${this.currentZoom.toFixed(2)}`);
      },
      onComplete: () => {
        // 缩放完成
        this.zoomComplete = true;
        this.statusText.setText('Zoom Complete!');
        this.statusText.setColor('#00ff88');
        
        // 添加完成提示动画
        this.tweens.add({
          targets: this.statusText,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 300,
          yoyo: true,
          repeat: 2
        });

        console.log('Zoom animation completed!');
      }
    });

    // 添加重启提示（可选）
    const restartText = this.add.text(width / 2, height - 20, 'Click to restart', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#888888'
    });
    restartText.setOrigin(0.5);
    restartText.setAlpha(0);

    // 缩放完成后显示重启提示
    this.time.delayedCall(2500, () => {
      this.tweens.add({
        targets: restartText,
        alpha: 1,
        duration: 500
      });
    });

    // 点击重启场景
    this.input.on('pointerdown', () => {
      if (this.zoomComplete) {
        this.scene.restart();
      }
    });
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: ZoomScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 暴露状态用于验证（可选）
window.getGameStatus = function() {
  const scene = game.scene.scenes[0];
  return {
    zoomComplete: scene.zoomComplete,
    currentZoom: scene.currentZoom,
    cameraZoom: scene.cameras.main.zoom
  };
};