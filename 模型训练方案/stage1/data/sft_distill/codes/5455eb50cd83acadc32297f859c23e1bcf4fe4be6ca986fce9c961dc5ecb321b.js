// MenuScene - 菜单场景
class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 场景状态标识
    this.sceneActive = true;
    
    // 添加标题
    const title = this.add.text(400, 150, 'Phaser3 游戏', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 创建按钮背景 (蓝色矩形)
    const buttonWidth = 200;
    const buttonHeight = 60;
    const buttonX = 400;
    const buttonY = 350;

    const buttonGraphics = this.add.graphics();
    buttonGraphics.fillStyle(0x0066cc, 1); // 蓝色
    buttonGraphics.fillRoundedRect(
      buttonX - buttonWidth / 2,
      buttonY - buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      10
    );

    // 添加按钮文本
    const buttonText = this.add.text(buttonX, buttonY, '开始游戏', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    buttonText.setOrigin(0.5);

    // 创建交互区域
    const buttonZone = this.add.zone(
      buttonX,
      buttonY,
      buttonWidth,
      buttonHeight
    ).setInteractive({ useHandCursor: true });

    // 按钮悬停效果
    buttonZone.on('pointerover', () => {
      buttonGraphics.clear();
      buttonGraphics.fillStyle(0x0088ff, 1); // 浅蓝色
      buttonGraphics.fillRoundedRect(
        buttonX - buttonWidth / 2,
        buttonY - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        10
      );
    });

    buttonZone.on('pointerout', () => {
      buttonGraphics.clear();
      buttonGraphics.fillStyle(0x0066cc, 1); // 恢复蓝色
      buttonGraphics.fillRoundedRect(
        buttonX - buttonWidth / 2,
        buttonY - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        10
      );
    });

    // 点击按钮切换到游戏场景
    buttonZone.on('pointerdown', () => {
      this.sceneActive = false;
      this.scene.start('GameScene');
    });

    // 添加提示文本
    const hint = this.add.text(400, 500, '点击按钮开始游戏', {
      fontSize: '18px',
      color: '#cccccc'
    });
    hint.setOrigin(0.5);
  }
}

// GameScene - 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 游戏状态变量（可验证的状态信号）
    this.score = 0;
    this.health = 100;
    this.level = 1;
    this.gameTime = 0;
    this.sceneActive = true;

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 标题
    const title = this.add.text(400, 50, '游戏场景', {
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 显示游戏状态
    this.scoreText = this.add.text(50, 120, `分数: ${this.score}`, {
      fontSize: '24px',
      color: '#00ff00'
    });

    this.healthText = this.add.text(50, 160, `生命值: ${this.health}`, {
      fontSize: '24px',
      color: '#ff6666'
    });

    this.levelText = this.add.text(50, 200, `关卡: ${this.level}`, {
      fontSize: '24px',
      color: '#66ccff'
    });

    this.timeText = this.add.text(50, 240, `游戏时间: ${this.gameTime.toFixed(1)}s`, {
      fontSize: '24px',
      color: '#ffff66'
    });

    // 创建游戏元素示例 - 一个可移动的方块
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(350, 350, 100, 100);
    
    const playerText = this.add.text(400, 400, '玩家', {
      fontSize: '20px',
      color: '#000000',
      fontStyle: 'bold'
    });
    playerText.setOrigin(0.5);

    // 添加游戏说明
    const instruction = this.add.text(400, 500, '这是游戏场景，状态信息实时更新', {
      fontSize: '18px',
      color: '#cccccc'
    });
    instruction.setOrigin(0.5);

    // 创建返回菜单按钮
    const backButtonWidth = 150;
    const backButtonHeight = 50;
    const backButtonX = 700;
    const backButtonY = 550;

    const backButtonGraphics = this.add.graphics();
    backButtonGraphics.fillStyle(0xff6666, 1);
    backButtonGraphics.fillRoundedRect(
      backButtonX - backButtonWidth / 2,
      backButtonY - backButtonHeight / 2,
      backButtonWidth,
      backButtonHeight,
      8
    );

    const backButtonText = this.add.text(backButtonX, backButtonY, '返回菜单', {
      fontSize: '20px',
      color: '#ffffff'
    });
    backButtonText.setOrigin(0.5);

    const backButtonZone = this.add.zone(
      backButtonX,
      backButtonY,
      backButtonWidth,
      backButtonHeight
    ).setInteractive({ useHandCursor: true });

    backButtonZone.on('pointerover', () => {
      backButtonGraphics.clear();
      backButtonGraphics.fillStyle(0xff8888, 1);
      backButtonGraphics.fillRoundedRect(
        backButtonX - backButtonWidth / 2,
        backButtonY - backButtonHeight / 2,
        backButtonWidth,
        backButtonHeight,
        8
      );
    });

    backButtonZone.on('pointerout', () => {
      backButtonGraphics.clear();
      backButtonGraphics.fillStyle(0xff6666, 1);
      backButtonGraphics.fillRoundedRect(
        backButtonX - backButtonWidth / 2,
        backButtonY - backButtonHeight / 2,
        backButtonWidth,
        backButtonHeight,
        8
      );
    });

    backButtonZone.on('pointerdown', () => {
      this.sceneActive = false;
      this.scene.start('MenuScene');
    });

    // 模拟游戏进程的定时器
    this.time.addEvent({
      delay: 1000,
      callback: this.updateGameState,
      callbackScope: this,
      loop: true
    });
  }

  update(time, delta) {
    // 更新游戏时间
    this.gameTime += delta / 1000;
    this.timeText.setText(`游戏时间: ${this.gameTime.toFixed(1)}s`);
  }

  updateGameState() {
    // 模拟游戏状态变化
    this.score += 10;
    this.health = Math.max(0, this.health - 5);
    
    if (this.score >= 100 * this.level) {
      this.level++;
      this.health = Math.min(100, this.health + 20);
    }

    // 更新显示
    this.scoreText.setText(`分数: ${this.score}`);
    this.healthText.setText(`生命值: ${this.health}`);
    this.levelText.setText(`关卡: ${this.level}`);

    // 游戏结束条件
    if (this.health <= 0) {
      this.add.text(400, 300, 'GAME OVER', {
        fontSize: '48px',
        color: '#ff0000',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      this.time.removeAllEvents();
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [MenuScene, GameScene] // 注册两个场景，MenuScene 为默认启动场景
};

// 创建游戏实例
new Phaser.Game(config);