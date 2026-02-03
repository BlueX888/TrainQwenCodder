class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.fadeInCount = 0;
    this.fadeOutCount = 0;
    this.totalFadeCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景图形，使用多个颜色块以便观察淡入淡出效果
    const graphics = this.add.graphics();
    
    // 绘制彩色背景
    graphics.fillStyle(0x4a90e2, 1);
    graphics.fillRect(0, 0, 400, 300);
    
    graphics.fillStyle(0xe24a4a, 1);
    graphics.fillRect(400, 0, 400, 300);
    
    graphics.fillStyle(0x4ae290, 1);
    graphics.fillRect(0, 300, 400, 300);
    
    graphics.fillStyle(0xe2e24a, 1);
    graphics.fillRect(400, 300, 400, 300);

    // 添加中心圆形作为参考
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(400, 300, 50);

    // 添加指示文本
    const instructionText = this.add.text(400, 100, 
      '按方向键触发淡入淡出效果:\n↑ 淡出 (黑色)\n↓ 淡入\n← 淡出 (白色)\n→ 淡入 (快速)', 
      {
        fontSize: '24px',
        color: '#000000',
        backgroundColor: '#ffffff',
        padding: { x: 10, y: 10 },
        align: 'center'
      }
    );
    instructionText.setOrigin(0.5);

    // 状态显示文本
    this.statusText = this.add.text(400, 500, 
      this.getStatusText(), 
      {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }
    );
    this.statusText.setOrigin(0.5);

    // 创建方向键
    this.cursors = this.input.keyboard.createCursorKeys();

    // 记录按键状态，避免重复触发
    this.keyPressed = {
      up: false,
      down: false,
      left: false,
      right: false
    };

    // 获取主相机
    this.mainCamera = this.cameras.main;

    // 监听淡入淡出完成事件
    this.mainCamera.on('camerafadeincomplete', () => {
      console.log('淡入完成');
    });

    this.mainCamera.on('camerafadeoutcomplete', () => {
      console.log('淡出完成');
    });
  }

  update() {
    // 上键：淡出到黑色
    if (this.cursors.up.isDown && !this.keyPressed.up) {
      this.keyPressed.up = true;
      
      // 检查是否正在进行淡入淡出
      if (!this.mainCamera.fadeEffect.isRunning) {
        this.mainCamera.fadeOut(1000, 0, 0, 0);
        this.fadeOutCount++;
        this.totalFadeCount++;
        this.updateStatusText();
        console.log('触发淡出效果 (黑色)');
      }
    }
    if (this.cursors.up.isUp) {
      this.keyPressed.up = false;
    }

    // 下键：淡入
    if (this.cursors.down.isDown && !this.keyPressed.down) {
      this.keyPressed.down = true;
      
      if (!this.mainCamera.fadeEffect.isRunning) {
        this.mainCamera.fadeIn(1000, 0, 0, 0);
        this.fadeInCount++;
        this.totalFadeCount++;
        this.updateStatusText();
        console.log('触发淡入效果');
      }
    }
    if (this.cursors.down.isUp) {
      this.keyPressed.down = false;
    }

    // 左键：淡出到白色
    if (this.cursors.left.isDown && !this.keyPressed.left) {
      this.keyPressed.left = true;
      
      if (!this.mainCamera.fadeEffect.isRunning) {
        this.mainCamera.fadeOut(1000, 255, 255, 255);
        this.fadeOutCount++;
        this.totalFadeCount++;
        this.updateStatusText();
        console.log('触发淡出效果 (白色)');
      }
    }
    if (this.cursors.left.isUp) {
      this.keyPressed.left = false;
    }

    // 右键：快速淡入 (500ms)
    if (this.cursors.right.isDown && !this.keyPressed.right) {
      this.keyPressed.right = true;
      
      if (!this.mainCamera.fadeEffect.isRunning) {
        this.mainCamera.fadeIn(500, 0, 0, 0);
        this.fadeInCount++;
        this.totalFadeCount++;
        this.updateStatusText();
        console.log('触发快速淡入效果');
      }
    }
    if (this.cursors.right.isUp) {
      this.keyPressed.right = false;
    }
  }

  getStatusText() {
    return `淡入: ${this.fadeInCount} | 淡出: ${this.fadeOutCount} | 总计: ${this.totalFadeCount}`;
  }

  updateStatusText() {
    this.statusText.setText(this.getStatusText());
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

const game = new Phaser.Game(config);