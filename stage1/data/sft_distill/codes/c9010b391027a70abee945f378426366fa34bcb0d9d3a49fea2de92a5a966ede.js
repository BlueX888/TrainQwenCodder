// MenuScene - 菜单场景
class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  preload() {
    // 菜单场景不需要预加载资源
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // 添加背景色
    this.cameras.main.setBackgroundColor('#2d2d2d');

    // 使用 Graphics 绘制白色按钮背景
    const buttonWidth = 200;
    const buttonHeight = 60;
    const buttonX = centerX - buttonWidth / 2;
    const buttonY = centerY - buttonHeight / 2;

    const buttonGraphics = this.add.graphics();
    buttonGraphics.fillStyle(0xffffff, 1);
    buttonGraphics.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);

    // 添加按钮文本
    const buttonText = this.add.text(centerX, centerY, '开始游戏', {
      fontSize: '24px',
      color: '#000000',
      fontFamily: 'Arial'
    });
    buttonText.setOrigin(0.5);

    // 创建交互区域
    const buttonZone = this.add.zone(centerX, centerY, buttonWidth, buttonHeight);
    buttonZone.setInteractive({ useHandCursor: true });

    // 鼠标悬停效果
    buttonZone.on('pointerover', () => {
      buttonGraphics.clear();
      buttonGraphics.fillStyle(0xcccccc, 1);
      buttonGraphics.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
    });

    buttonZone.on('pointerout', () => {
      buttonGraphics.clear();
      buttonGraphics.fillStyle(0xffffff, 1);
      buttonGraphics.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
    });

    // 点击事件 - 切换到游戏场景
    buttonZone.on('pointerdown', () => {
      buttonGraphics.clear();
      buttonGraphics.fillStyle(0x999999, 1);
      buttonGraphics.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
      
      // 延迟切换场景，让用户看到按下效果
      this.time.delayedCall(100, () => {
        this.scene.start('GameScene');
      });
    });

    // 添加标题
    const titleText = this.add.text(centerX, centerY - 100, 'Phaser3 游戏', {
      fontSize: '48px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    titleText.setOrigin(0.5);
  }

  update(time, delta) {
    // 菜单场景不需要更新逻辑
  }
}

// GameScene - 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号变量
    this.score = 0;
    this.level = 1;
    this.health = 100;
    this.gameState = 'playing'; // playing, paused, gameover
  }

  preload() {
    // 游戏场景不需要预加载外部资源
  }

  create() {
    // 设置背景色
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // 初始化状态
    this.score = 0;
    this.level = 1;
    this.health = 100;
    this.gameState = 'playing';

    // 创建玩家（使用 Graphics 绘制）
    this.player = this.createPlayer(400, 500);

    // 创建目标物体
    this.target = this.createTarget(400, 200);

    // 显示状态信息
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });

    this.levelText = this.add.text(16, 46, 'Level: 1', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });

    this.healthText = this.add.text(16, 76, 'Health: 100', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });

    this.stateText = this.add.text(16, 106, 'State: playing', {
      fontSize: '20px',
      color: '#00ff00',
      fontFamily: 'Arial'
    });

    // 添加返回菜单按钮
    this.createBackButton();

    // 添加游戏说明
    const instructions = this.add.text(400, 550, '点击目标获得分数 | ESC 返回菜单', {
      fontSize: '16px',
      color: '#888888',
      fontFamily: 'Arial'
    });
    instructions.setOrigin(0.5);

    // 键盘输入
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // 目标点击事件
    this.target.setInteractive();
    this.target.on('pointerdown', () => {
      this.onTargetClicked();
    });
  }

  createPlayer(x, y) {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(0, 0, 20);
    graphics.x = x;
    graphics.y = y;
    return graphics;
  }

  createTarget(x, y) {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(0, 0, 30);
    graphics.lineStyle(3, 0xffffff, 1);
    graphics.strokeCircle(0, 0, 30);
    graphics.x = x;
    graphics.y = y;
    return graphics;
  }

  createBackButton() {
    const buttonWidth = 120;
    const buttonHeight = 40;
    const buttonX = 680;
    const buttonY = 16;

    const buttonGraphics = this.add.graphics();
    buttonGraphics.fillStyle(0x444444, 1);
    buttonGraphics.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 5);

    const buttonText = this.add.text(buttonX + buttonWidth / 2, buttonY + buttonHeight / 2, '返回菜单', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    buttonText.setOrigin(0.5);

    const buttonZone = this.add.zone(buttonX + buttonWidth / 2, buttonY + buttonHeight / 2, buttonWidth, buttonHeight);
    buttonZone.setInteractive({ useHandCursor: true });

    buttonZone.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }

  onTargetClicked() {
    if (this.gameState !== 'playing') return;

    // 更新分数
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);

    // 每50分升级
    if (this.score % 50 === 0) {
      this.level++;
      this.levelText.setText('Level: ' + this.level);
    }

    // 随机移动目标（使用固定种子保证确定性）
    const seed = this.score;
    const randomX = 100 + (seed * 7919) % 600;
    const randomY = 100 + (seed * 3571) % 350;
    
    this.target.x = randomX;
    this.target.y = randomY;

    // 模拟健康值变化
    this.health = Math.max(0, this.health - 5);
    this.healthText.setText('Health: ' + this.health);

    if (this.health <= 0) {
      this.gameState = 'gameover';
      this.stateText.setText('State: gameover');
      this.stateText.setColor('#ff0000');
      this.showGameOver();
    }
  }

  showGameOver() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    const gameOverText = this.add.text(centerX, centerY, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    gameOverText.setOrigin(0.5);

    const finalScoreText = this.add.text(centerX, centerY + 60, 'Final Score: ' + this.score, {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    finalScoreText.setOrigin(0.5);
  }

  update(time, delta) {
    // ESC 键返回菜单
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.scene.start('MenuScene');
    }

    // 可以在这里添加更多游戏逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [MenuScene, GameScene], // 场景数组，第一个场景自动启动
  parent: 'game-container'
};

// 创建游戏实例
new Phaser.Game(config);