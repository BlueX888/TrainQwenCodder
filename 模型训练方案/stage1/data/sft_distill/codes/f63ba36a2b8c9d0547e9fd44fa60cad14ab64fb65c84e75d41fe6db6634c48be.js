class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isPaused = false; // 可验证的状态信号
    this.pauseOverlay = null;
    this.pauseText = null;
    this.ball = null;
    this.ballVelocity = { x: 2, y: 2 };
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建一个移动的小球作为游戏运行的可视化指示
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(0, 0, 20);
    graphics.generateTexture('ball', 40, 40);
    graphics.destroy();

    this.ball = this.add.sprite(400, 300, 'ball');
    
    // 添加边界文字说明
    const instructionText = this.add.text(10, 10, 
      'Press ANY Arrow Key to Pause/Resume', 
      { 
        fontSize: '20px', 
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }
    );
    instructionText.setDepth(100);

    // 添加状态显示
    this.statusText = this.add.text(10, 50, 
      'Status: Running', 
      { 
        fontSize: '18px', 
        color: '#00ff00',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }
    );
    this.statusText.setDepth(100);

    // 监听方向键
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 添加键盘事件监听
    this.input.keyboard.on('keydown', (event) => {
      // 检测是否是方向键
      if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.UP ||
          event.keyCode === Phaser.Input.Keyboard.KeyCodes.DOWN ||
          event.keyCode === Phaser.Input.Keyboard.KeyCodes.LEFT ||
          event.keyCode === Phaser.Input.Keyboard.KeyCodes.RIGHT) {
        this.togglePause();
      }
    });

    console.log('Game started. Press any arrow key to pause/resume.');
  }

  update(time, delta) {
    // 只有在非暂停状态下才更新小球位置
    if (!this.isPaused) {
      this.ball.x += this.ballVelocity.x;
      this.ball.y += this.ballVelocity.y;

      // 边界反弹
      if (this.ball.x <= 20 || this.ball.x >= 780) {
        this.ballVelocity.x *= -1;
      }
      if (this.ball.y <= 20 || this.ball.y >= 580) {
        this.ballVelocity.y *= -1;
      }
    }
  }

  togglePause() {
    if (this.isPaused) {
      // 继续游戏
      this.resumeGame();
    } else {
      // 暂停游戏
      this.pauseGame();
    }
  }

  pauseGame() {
    this.isPaused = true;
    
    // 创建蓝色半透明覆盖层
    this.pauseOverlay = this.add.graphics();
    this.pauseOverlay.fillStyle(0x0000ff, 0.7);
    this.pauseOverlay.fillRect(0, 0, 800, 600);
    this.pauseOverlay.setDepth(1000);

    // 创建 "PAUSED" 文字
    this.pauseText = this.add.text(400, 300, 'PAUSED', {
      fontSize: '64px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.pauseText.setOrigin(0.5, 0.5);
    this.pauseText.setDepth(1001);

    // 添加提示文字
    this.pauseHintText = this.add.text(400, 380, 
      'Press any Arrow Key to Resume', 
      {
        fontSize: '24px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    this.pauseHintText.setOrigin(0.5, 0.5);
    this.pauseHintText.setDepth(1001);

    // 更新状态文字
    this.statusText.setText('Status: Paused');
    this.statusText.setColor('#ff0000');

    console.log('Game paused. isPaused =', this.isPaused);
  }

  resumeGame() {
    this.isPaused = false;

    // 移除覆盖层和文字
    if (this.pauseOverlay) {
      this.pauseOverlay.destroy();
      this.pauseOverlay = null;
    }

    if (this.pauseText) {
      this.pauseText.destroy();
      this.pauseText = null;
    }

    if (this.pauseHintText) {
      this.pauseHintText.destroy();
      this.pauseHintText = null;
    }

    // 更新状态文字
    this.statusText.setText('Status: Running');
    this.statusText.setColor('#00ff00');

    console.log('Game resumed. isPaused =', this.isPaused);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: GameScene
};

const game = new Phaser.Game(config);

// 暴露状态用于验证
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    isPaused: scene.isPaused,
    ballPosition: { x: scene.ball.x, y: scene.ball.y }
  };
};

console.log('Use window.getGameState() to check game state');