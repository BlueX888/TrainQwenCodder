// MenuScene - 菜单场景
class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 添加标题文字
    const titleText = this.add.text(400, 150, '游戏菜单', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    titleText.setOrigin(0.5);

    // 创建蓝色按钮背景
    const buttonWidth = 200;
    const buttonHeight = 60;
    const buttonX = 400;
    const buttonY = 300;

    const buttonGraphics = this.add.graphics();
    buttonGraphics.fillStyle(0x0066cc, 1); // 蓝色
    buttonGraphics.fillRoundedRect(
      buttonX - buttonWidth / 2,
      buttonY - buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      10
    );

    // 添加按钮文字
    const buttonText = this.add.text(buttonX, buttonY, '开始游戏', {
      fontSize: '24px',
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
    ).setInteractive();

    // 添加悬停效果
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
      this.input.setDefaultCursor('pointer');
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
      this.input.setDefaultCursor('default');
    });

    // 点击按钮切换到游戏场景
    buttonZone.on('pointerdown', () => {
      console.log('开始游戏按钮被点击');
      this.scene.start('GameScene');
    });

    // 添加提示文字
    const hintText = this.add.text(400, 450, '点击按钮开始游戏', {
      fontSize: '18px',
      color: '#aaaaaa'
    });
    hintText.setOrigin(0.5);
  }
}

// GameScene - 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 可验证的状态变量
    this.score = 0;
    this.level = 1;
    this.health = 100;
    this.gameTime = 0;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 背景色
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // 添加游戏标题
    const titleText = this.add.text(400, 50, '游戏场景', {
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    titleText.setOrigin(0.5);

    // 显示游戏状态信息
    this.scoreText = this.add.text(50, 100, `分数: ${this.score}`, {
      fontSize: '20px',
      color: '#00ff00'
    });

    this.levelText = this.add.text(50, 130, `等级: ${this.level}`, {
      fontSize: '20px',
      color: '#ffaa00'
    });

    this.healthText = this.add.text(50, 160, `生命值: ${this.health}`, {
      fontSize: '20px',
      color: '#ff0000'
    });

    this.timeText = this.add.text(50, 190, `游戏时间: ${this.gameTime}s`, {
      fontSize: '20px',
      color: '#00aaff'
    });

    // 创建一个简单的玩家对象（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(375, 275, 50, 50);

    this.add.text(400, 350, '玩家', {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 添加返回菜单按钮
    const backButtonWidth = 150;
    const backButtonHeight = 50;
    const backButtonX = 400;
    const backButtonY = 500;

    const backButtonGraphics = this.add.graphics();
    backButtonGraphics.fillStyle(0x666666, 1);
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
    ).setInteractive();

    backButtonZone.on('pointerover', () => {
      backButtonGraphics.clear();
      backButtonGraphics.fillStyle(0x888888, 1);
      backButtonGraphics.fillRoundedRect(
        backButtonX - backButtonWidth / 2,
        backButtonY - backButtonHeight / 2,
        backButtonWidth,
        backButtonHeight,
        8
      );
      this.input.setDefaultCursor('pointer');
    });

    backButtonZone.on('pointerout', () => {
      backButtonGraphics.clear();
      backButtonGraphics.fillStyle(0x666666, 1);
      backButtonGraphics.fillRoundedRect(
        backButtonX - backButtonWidth / 2,
        backButtonY - backButtonHeight / 2,
        backButtonWidth,
        backButtonHeight,
        8
      );
      this.input.setDefaultCursor('default');
    });

    backButtonZone.on('pointerdown', () => {
      console.log('返回菜单');
      this.scene.start('MenuScene');
    });

    // 添加说明文字
    this.add.text(400, 420, '游戏状态会随时间更新', {
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    // 更新游戏时间
    this.gameTime += delta / 1000;
    this.timeText.setText(`游戏时间: ${this.gameTime.toFixed(1)}s`);

    // 模拟游戏状态变化（每秒增加分数）
    if (Math.floor(this.gameTime) > Math.floor(this.gameTime - delta / 1000)) {
      this.score += 10;
      this.scoreText.setText(`分数: ${this.score}`);

      // 每100分升级
      if (this.score % 100 === 0 && this.score > 0) {
        this.level++;
        this.levelText.setText(`等级: ${this.level}`);
      }

      // 模拟生命值变化
      this.health = Math.max(0, this.health - 5);
      this.healthText.setText(`生命值: ${this.health}`);
    }
  }
}

// Phaser Game 配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#16213e',
  scene: [MenuScene, GameScene], // 场景数组，第一个为初始场景
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  }
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 输出可验证的状态信息
console.log('游戏已启动');
console.log('初始场景: MenuScene');
console.log('可用场景: MenuScene, GameScene');