class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号：缩放动画完成标志
    this.zoomComplete = false;
    this.currentZoom = 0.1;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, width, height);
    
    // 创建中心圆形
    const centerCircle = this.add.graphics();
    centerCircle.fillStyle(0x16213e, 1);
    centerCircle.fillCircle(width / 2, height / 2, 150);
    
    // 创建装饰性方块
    const decorations = this.add.graphics();
    decorations.fillStyle(0x0f3460, 1);
    decorations.fillRect(width / 2 - 200, height / 2 - 200, 100, 100);
    decorations.fillRect(width / 2 + 100, height / 2 - 200, 100, 100);
    decorations.fillRect(width / 2 - 200, height / 2 + 100, 100, 100);
    decorations.fillRect(width / 2 + 100, height / 2 + 100, 100, 100);
    
    // 创建中心文本
    const text = this.add.text(width / 2, height / 2, 'ZOOM IN', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#e94560',
      fontStyle: 'bold'
    });
    text.setOrigin(0.5);
    
    // 创建状态显示文本
    this.statusText = this.add.text(20, 20, 'Zoom: 0.10 | Status: Zooming...', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    
    // 设置相机初始缩放
    this.cameras.main.setZoom(0.1);
    this.currentZoom = 0.1;
    
    // 创建缩放动画
    this.tweens.add({
      targets: this.cameras.main,
      zoom: 1.0,
      duration: 2500,
      ease: 'Cubic.easeOut',
      onUpdate: (tween) => {
        // 更新当前缩放值
        this.currentZoom = this.cameras.main.zoom;
        this.updateStatus();
      },
      onComplete: () => {
        // 标记缩放完成
        this.zoomComplete = true;
        this.updateStatus();
        
        // 添加完成提示
        const completeText = this.add.text(width / 2, height / 2 + 100, 'Zoom Complete!', {
          fontSize: '32px',
          fontFamily: 'Arial',
          color: '#00ff00',
          fontStyle: 'bold'
        });
        completeText.setOrigin(0.5);
        
        // 让完成文本闪烁
        this.tweens.add({
          targets: completeText,
          alpha: 0,
          duration: 500,
          yoyo: true,
          repeat: 2
        });
      }
    });
    
    // 添加额外的视觉反馈 - 旋转的星星
    this.createStars();
  }
  
  createStars() {
    const { width, height } = this.cameras.main;
    
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      const radius = 250;
      const x = width / 2 + Math.cos(angle) * radius;
      const y = height / 2 + Math.sin(angle) * radius;
      
      const star = this.add.graphics();
      star.fillStyle(0xe94560, 1);
      star.fillCircle(0, 0, 10);
      star.setPosition(x, y);
      
      // 让星星旋转
      this.tweens.add({
        targets: star,
        angle: 360,
        duration: 3000,
        repeat: -1,
        ease: 'Linear'
      });
    }
  }
  
  updateStatus() {
    const zoomPercent = (this.currentZoom * 100).toFixed(0);
    const status = this.zoomComplete ? 'Complete!' : 'Zooming...';
    this.statusText.setText(`Zoom: ${this.currentZoom.toFixed(2)} (${zoomPercent}%) | Status: ${status}`);
  }
  
  update(time, delta) {
    // 持续更新状态显示
    if (!this.zoomComplete) {
      this.updateStatus();
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);