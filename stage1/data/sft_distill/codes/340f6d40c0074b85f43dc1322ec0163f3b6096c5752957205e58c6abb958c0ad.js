// 游戏主场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isPaused = false; // 暂停状态信号
    this.gameTime = 0; // 游戏运行时间（验证暂停时不增长）
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建一个移动的小球用于验证暂停效果
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0xff0000, 1);
    ballGraphics.fillCircle(0, 0, 20);
    ballGraphics.generateTexture('ball', 40, 40);
    ballGraphics.destroy();

    this.ball = this.add.sprite(100, 300, 'ball');
    this.ball.setVelocity = { x: 200, y: 100 }; // 模拟速度

    // 创建状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建暂停覆盖层（初始隐藏）
    this.createPauseOverlay();

    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.togglePause();
      }
    });

    // 更新初始状态文本
    this.updateStatusText();
  }

  createPauseOverlay() {
    // 创建容器用于组织暂停界面元素
    this.pauseContainer = this.add.container(0, 0);

    // 创建蓝色半透明覆盖层
    const overlay = this.add.graphics();
    overlay.fillStyle(0x0066cc, 0.7);
    overlay.fillRect(0, 0, 800, 600);

    // 创建 "PAUSED" 文字
    const pausedText = this.add.text(400, 300, 'PAUSED', {
      fontSize: '80px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    });
    pausedText.setOrigin(0.5, 0.5);

    // 创建提示文字
    const hintText = this.add.text(400, 380, 'Click to Resume', {
      fontSize: '24px',
      color: '#ffffff'
    });
    hintText.setOrigin(0.5, 0.5);

    // 将元素添加到容器
    this.pauseContainer.add([overlay, pausedText, hintText]);

    // 设置容器深度，确保在最上层
    this.pauseContainer.setDepth(1000);

    // 初始隐藏
    this.pauseContainer.setVisible(false);
  }

  togglePause() {
    if (this.isPaused) {
      // 继续游戏
      this.scene.resume();
      this.isPaused = false;
      this.pauseContainer.setVisible(false);
      console.log('Game Resumed');
    } else {
      // 暂停游戏
      this.scene.pause();
      this.isPaused = true;
      this.pauseContainer.setVisible(true);
      console.log('Game Paused');
    }
    this.updateStatusText();
  }

  updateStatusText() {
    const status = this.isPaused ? 'PAUSED' : 'RUNNING';
    this.statusText.setText([
      `Status: ${status}`,
      `Game Time: ${this.gameTime.toFixed(1)}s`,
      `Ball Position: (${Math.round(this.ball.x)}, ${Math.round(this.ball.y)})`,
      `Click to ${this.isPaused ? 'Resume' : 'Pause'}`
    ]);
  }

  update(time, delta) {
    // 更新游戏时间（暂停时不会执行）
    this.gameTime += delta / 1000;

    // 移动小球（模拟游戏活动）
    this.ball.x += this.ball.setVelocity.x * delta / 1000;
    this.ball.y += this.ball.setVelocity.y * delta / 1000;

    // 边界反弹
    if (this.ball.x > 780 || this.ball.x < 20) {
      this.ball.setVelocity.x *= -1;
    }
    if (this.ball.y > 580 || this.ball.y < 20) {
      this.ball.setVelocity.y *= -1;
    }

    // 更新状态显示
    this.updateStatusText();
  }
}

// 游戏配置
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

// 暴露全局变量用于测试验证
window.game = game;
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    isPaused: scene.isPaused,
    gameTime: scene.gameTime,
    ballPosition: { x: scene.ball.x, y: scene.ball.y }
  };
};